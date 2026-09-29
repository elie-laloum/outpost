import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createObservationHub,
  dispatch,
  defineIsolatedTask,
  defineWorkflow,
  createSandbox,
  defineCommandTask,
  createLocalTransport,
  readJournal,
  recoveryDetails,
} from "../../src/index.ts";
import type { Observation } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";

function recording() {
  const events: Observation[] = [];
  return {
    events,
    observation: createObservationHub({
      sinks: [
        {
          observe(event) {
            events.push(event);
          },
        },
      ],
    }),
  };
}

test("one workflow sink observes concurrent isolated dispatches, operations and attempt scopes", async (t) => {
  const root = await repository(t);
  const { events, observation } = recording();
  const tasks = ["left", "right"].map((key) =>
    defineIsolatedTask({
      key,
      request: () => ({
        repository: root,
        branch: { mode: "named", name: key },
        sandboxProvider: createLocalSandboxProvider(),
        agent: scripted(emit("<outpost>done</outpost>")),
        brief: { text: "test" },
        logging: false,
      }),
    }),
  );
  const result = await defineWorkflow("parallel", tasks).start({
    observation,
    concurrency: 2,
  });
  result.unwrap();
  assert.equal(result.observerErrors.length, 0);
  assert.deepEqual(
    events.map((value) => value.seq),
    events.map((_, index) => index + 1),
  );
  const finished = events.filter(
    (value) => value.event.kind === "dispatch-finished",
  );
  assert.equal(finished.length, 2);
  assert.equal(
    new Set(finished.map((value) => value.scope.dispatchId)).size,
    2,
  );
  assert.deepEqual(
    new Set(finished.map((value) => value.scope.taskKey)),
    new Set(["left", "right"]),
  );
  assert.ok(
    finished.every(
      (value) =>
        value.scope.executionId === result.executionId &&
        value.scope.attempt === 1,
    ),
  );
  for (const name of [
    "workspace.allocate",
    "sandbox.acquire",
    "agent.prepare",
    "commits.collect",
    "sandbox.release",
    "workspace.cleanup",
  ])
    assert.ok(
      events.some(
        (value) =>
          value.event.kind === "operation" &&
          value.event.name === name &&
          value.event.status === "finished",
      ),
      name,
    );
  assert.ok(
    events.some(
      (value) => value.event.kind === "text" && value.scope.pass === 1,
    ),
  );
});

test("command task streams both channels and retains nonzero status", async (t) => {
  const root = await repository(t);
  const { events, observation } = recording();
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
  });
  const task = defineCommandTask({
    key: "command",
    sandbox,
    command: {
      executable: process.execPath,
      arguments: [
        "-e",
        "process.stdout.write('out');process.stderr.write('err');process.exitCode=7",
      ],
    },
  });
  const result = await defineWorkflow("command", [task]).start({ observation });
  assert.equal(result.status, "failed");
  const chunks = events.flatMap((value) =>
    value.event.kind === "command-output" ? [value.event] : [],
  );
  assert.equal(
    chunks
      .filter((value) => value.channel === "stdout")
      .map((value) => value.text)
      .join(""),
    "out",
  );
  assert.equal(
    chunks
      .filter((value) => value.channel === "stderr")
      .map((value) => value.text)
      .join(""),
    "err",
  );
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
});

test("journal includes scoped operations and finish while stderr remains live-only by default", async (t) => {
  const root = await repository(t);
  const { events, observation } = recording();
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: scripted(
      "process.stderr.write('diagnostic\\ntail');" +
        emit("<outpost>done</outpost>"),
    ),
    brief: { text: "test" },
    observation,
  });
  const stderr = events.flatMap((value) =>
    value.event.kind === "stderr" ? [value.event.text] : [],
  );
  assert.deepEqual(stderr, ["diagnostic", "tail"]);
  const journal = await readJournal({
    transporter: createLocalTransport({
      directory: `${root}/.outpost/storage`,
    }),
    reference: result.logReference!,
  });
  const serialized = JSON.stringify(journal);
  assert.match(serialized, /dispatch-finished/);
  assert.match(serialized, /sandbox.acquire/);
  assert.match(serialized, /dispatchId/);
  assert.doesNotMatch(serialized, /diagnostic/);
});

test("sink failures preserve dispatch results and early failure identity", async (t) => {
  const root = await repository(t);
  const observation = createObservationHub({
    sinks: [
      {
        async observe() {
          throw new Error("sink failed");
        },
      },
    ],
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: scripted(emit("<outpost>done</outpost>")),
    brief: { text: "test" },
    observation,
    logging: false,
  });
  assert.equal(result.completed, true);
  assert.ok(result.observerErrors?.length);
  const { events, observation: early } = recording();
  const failure = new Error("allocation failed");
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: {
        ...createLocalSandboxProvider(),
        async acquire() {
          throw failure;
        },
      },
      agent: scripted(""),
      brief: { text: "test" },
      observation: early,
      logging: false,
    }),
    (error) => error === failure,
  );
  assert.equal(
    events.filter((value) => value.event.kind === "dispatch-finished").length,
    1,
  );
  assert.ok(recoveryDetails(failure));
});

test("async task callbacks remain additional sinks and report failures without corrupting usage", async (t) => {
  const root = await repository(t);
  const { observation } = recording();
  const run = defineIsolatedTask({
    key: "run",
    request: () => ({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: scripted(
        "console.log(JSON.stringify({kind:'usage',tokens:{input:3,cached:0,output:2}}));" +
          emit("<outpost>done</outpost>"),
      ),
      brief: { text: "test" },
      logging: false,
      async observe(event) {
        if (event.kind === "text") throw new Error("async observer failed");
      },
    }),
  });
  const result = await defineWorkflow("callbacks", [run]).start({
    observation,
  });
  result.unwrap();
  assert.equal(result.usage.tokens.input, 3);
  assert.ok(
    result.observerErrors.some(
      (error) =>
        error instanceof Error && error.message === "async observer failed",
    ),
  );
  assert.ok(result.value(run).observerErrors?.length);
});
