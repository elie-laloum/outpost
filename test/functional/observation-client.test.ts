import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import {
  createObservation,
  createLocalTransport,
  createReporter,
  createCustomReporter,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  dispatch,
} from "../../src/index.ts";
import type { Observation, RunEvent, Transport } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";

async function collect<T>(events: AsyncIterable<T>) {
  const values: T[] = [];
  for await (const value of events) values.push(value);
  return values;
}
function barrier() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test("a copied observation client records a dispatch and reads its masked events from another client", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  const output: string[] = [];
  const custom: string[] = [];
  await using observation = createObservation({
    transporter,
    redact: [/secret/g],
    sinks: [
      createReporter({ write: (text) => output.push(text) }),
      createCustomReporter({
        text: (event) => {
          custom.push(event.text);
        },
      }),
    ],
  });
  assert.equal(await observation.readRun("dispatch"), undefined);
  const result = await dispatch({
    runId: "dispatch",
    observation: {
      ...observation,
      emit: (source, event) => observation.emit(source, event),
    },
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: scripted(emit("secret")),
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(result.runId, "dispatch");
  assert.equal(result.observationId, result.runId);
  assert.deepEqual(result.observerErrors, []);
  await using reader = createObservation({ transporter });
  const snapshot = await reader.readRun(result.observationId!);
  assert.equal(snapshot?.status, "done");
  assert.equal(snapshot?.complete, true);
  const events = await collect(reader.watchRun("dispatch"));
  assert.equal(events.length, snapshot?.seq);
  assert.doesNotMatch(JSON.stringify(events), /secret/);
  assert.doesNotMatch(output.join(""), /secret/);
  assert.doesNotMatch(custom.join(""), /secret/);
  assert.ok(custom.length > 0);
  assert.deepEqual(
    await collect(reader.watchRun("dispatch", { from: snapshot!.seq })),
    [],
  );
  await assert.rejects(
    dispatch({
      runId: "dispatch",
      observation,
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: scripted(emit("never")),
      brief: { text: "test" },
      logging: false,
    }),
  );
});

test("one observation isolates concurrent workflows and owns their closure without cancelling them", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  const observation = createObservation({ transporter });
  const entered = [barrier(), barrier()];
  const finish = barrier();
  const runs = entered.map((ready, i) =>
    defineWorkflow(`flow${i}`, [
      defineTask({
        key: "task",
        async perform() {
          ready.release();
          await finish.promise;
          return i;
        },
      }),
    ]).start({ observation, runId: `run${i}` }),
  );
  await Promise.all(entered.map((ready) => ready.promise));
  await observation.flush();
  await using reader = createObservation({ transporter });
  const controller = new AbortController();
  const cancelled = collect(
    reader.watchRun("run0", { signal: controller.signal, pollMs: 1 }),
  );
  controller.abort();
  await assert.rejects(cancelled);
  let closed = false;
  const closing = observation.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  assert.equal(closed, false);
  assert.equal((await reader.readRun("run0"))?.status, "running");
  await assert.rejects(
    defineWorkflow("closed", []).start({ observation }),
    /closed/,
  );
  finish.release();
  const results = await Promise.all(runs);
  await closing;
  for (const [i, result] of results.entries()) {
    assert.equal(result.status, "done");
    assert.equal(result.runId, `run${i}`);
    const snapshot = await reader.readRun(result.runId!);
    assert.equal(snapshot?.complete, true);
    assert.equal(snapshot?.workflow, `flow${i}`);
    assert.deepEqual(
      (await collect(reader.watchRun(result.runId!))).map(
        (event) => event.observationSeq,
      ),
      Array.from({ length: snapshot!.seq }, (_, i) => i + 1),
    );
  }
  await observation.close();
});

test("scoped clients preserve redaction and nested dispatches belong to the workflow", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  const values: Observation[] = [];
  await using observation = createObservation({ transporter });
  const child = observation.child(
    {},
    [
      {
        observe: (value) => {
          values.push(value);
        },
      },
    ],
    [/private/g],
  );
  const task = defineTask({
    key: "agent",
    async perform(context) {
      const result = await dispatch({
        observation: context.observation!,
        repository: root,
        sandboxProvider: createLocalSandboxProvider(),
        agent: scripted(emit("private")),
        brief: { text: "test" },
        logging: false,
      });
      assert.equal(result.observationId, undefined);
      return result.text;
    },
  });
  const result = await defineWorkflow("parent", [task]).start({
    observation: child,
  });
  assert.ok(result.runId);
  const snapshot = await observation.readRun(result.runId);
  assert.equal(snapshot?.dispatches.length, 1);
  assert.equal(snapshot?.complete, true);
  assert.doesNotMatch(JSON.stringify(values), /private/);
  assert.equal(
    (await collect(transporter.list("runs/"))).filter((entry) =>
      entry.key.endsWith("/index"),
    ).length,
    1,
  );
  await child.close();
});

test("settled workflow resume keeps its cursor and checkpoint identity", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  await using observation = createObservation({ transporter });
  const checkpoint = {
    store: createWorkflowCheckpointStore({ transporter }),
    runId: "durable",
    version: "1",
  };
  let effects = 0;
  const workflow = defineWorkflow("resume", [
    defineTask({
      key: "once",
      perform() {
        return ++effects;
      },
    }),
  ]);
  const first = await workflow.start({ observation, checkpoint });
  const snapshot = await observation.readRun("durable");
  const second = await workflow.start({ observation, checkpoint });
  const resumed = await observation.readRun("durable");
  assert.equal(effects, 1);
  assert.equal(first.executionId, second.executionId);
  assert.equal(second.runId, "durable");
  assert.equal(first.observationId, "durable");
  assert.equal(second.observationId, "durable");
  assert.equal(resumed?.complete, true);
  assert.ok(resumed!.seq > snapshot!.seq);
  assert.equal(
    (await collect(observation.watchRun("durable", { from: snapshot!.seq })))[0]
      ?.seq,
    snapshot!.seq + 1,
  );
});

test("storage delivery failures leave the dispatch outcome intact and surface errors", async (t) => {
  const root = await repository(t);
  const storage = createLocalTransport({ directory: join(root, "store") });
  const transporter: Transport = {
    ...storage,
    async write(key, bytes, options) {
      if (key.includes("/events/")) throw new Error("offline");
      return storage.write(key, bytes, options);
    },
  };
  await using observation = createObservation({ transporter });
  const result = await dispatch({
    observation,
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: scripted(emit("ok")),
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(result.text, "ok");
  assert.ok(result.observerErrors?.length);
  assert.ok(observation.errors.length);
});

test("observation needs no transport for reporting and records failed dispatches", async (t) => {
  const root = await repository(t);
  const events: Observation[] = [];
  await using reporting = createObservation({
    sinks: [
      {
        observe: (value) => {
          events.push(value);
        },
      },
    ],
  });
  const result = await defineWorkflow("report", []).start({
    observation: reporting,
  });
  assert.ok(result.runId);
  assert.ok(events.length);
  assert.throws(() => reporting.readRun("missing"), /transporter/);
  assert.throws(() => reporting.watchRun("missing"), /transporter/);
  assert.throws(
    () => createObservation({ heartbeatMs: 10, abandonAfterMs: 5 }),
    /exceed/,
  );
  const transporter = createLocalTransport({ directory: join(root, "store") });
  await using observation = createObservation({ transporter });
  await assert.rejects(
    dispatch({
      observation,
      runId: "failed",
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: scripted("process.exit(7)"),
      brief: { text: "test" },
      logging: false,
    }),
  );
  assert.equal((await observation.readRun("failed"))?.status, "failed");
});

test("YAML observation owns persistence for an ephemeral command workflow", async (t) => {
  const { writeFile, readFile } = await import("node:fs/promises");
  const { pathToFileURL } = await import("node:url");
  const { resolve } = await import("node:path");
  const { createRecipeRuntime, validateRecipeProject } =
    await import("../../src/recipes.ts");
  const root = await repository(t);
  const file = join(root, "recipe.yaml");
  const config = join(root, "outpost.yaml");
  const reporterLog = join(root, "reporter.log");
  await writeFile(
    join(root, "reporter.mjs"),
    `import { createReporter } from ${JSON.stringify(pathToFileURL(resolve("src/index.ts")).href)};
import { appendFileSync } from "node:fs";
export const sink = createReporter({ verbose: true, write: text => appendFileSync(${JSON.stringify(reporterLog)}, text) });
const observe = sink.observe;
sink.observe = value => { appendFileSync(${JSON.stringify(reporterLog)}, value.event.kind + "\\n"); observe(value); };`,
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "observed",
      workflow: { runId: "yaml-run" },
      tasks: [
        {
          key: "hello",
          command: {
            executable: process.execPath,
            arguments: ["-e", "console.log('hello')"],
          },
        },
      ],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 3,
      workspace: { kind: "ephemeral" },
      runtime: { directory: "./runtime" },
      sandbox: { provider: "local" },
      transports: { runs: { type: "local", directory: "./runs" } },
      extensions: {
        reporter: {
          module: "./reporter.mjs",
          export: "sink",
          kind: "sink",
          version: "1",
        },
      },
      observation: {
        transporter: { $ref: "transports.runs" },
        sinks: [{ $ref: "extensions.reporter" }],
      },
    }),
  );
  await validateRecipeProject({ file, config });
  await using runtime = await createRecipeRuntime({ file, config });
  const result = await runtime.run();
  assert.equal(result.status, "done", JSON.stringify(result.errors));
  await using reader = createObservation({
    transporter: createLocalTransport({ directory: join(root, "runs") }),
  });
  const snapshot = await reader.readRun("yaml-run");
  assert.equal(snapshot?.status, "done");
  assert.equal(snapshot?.complete, true);
  assert.equal(snapshot?.tasks[0]?.key, "hello");
  assert.match(await readFile(reporterLog, "utf8"), /workflow/);
  assert.deepEqual(result.observerErrors ?? [], []);
});

test("reporter stream suppression is isolated between interleaved dispatches", async () => {
  const lines: string[] = [];
  await using observation = createObservation({
    sinks: [createReporter({ write: (line) => lines.push(line) })],
  });
  const first = observation.child({ dispatchId: "first", pass: 1 });
  const second = observation.child({ dispatchId: "second", pass: 1 });
  first.emit("agent", { kind: "text-delta", text: "alpha" });
  second.emit("agent", { kind: "text", text: "beta" });
  first.emit("agent", { kind: "text", text: "alpha" });
  await observation.flush();
  assert.equal(lines.join(""), "alphabeta");
});

test("file dispatch registration covers allocation failure and output publication failure", async (t) => {
  const { createAgent, createHarness } = await import("../../src/index.ts");
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "runs") });
  await using observation = createObservation({ transporter });
  const agent = createAgent({
    model: "offline",
    harness: createHarness({
      modelProvider: {
        name: "offline",
        request: async () => ({
          text: "private answer",
          usage: { input: 1, cached: 0, output: 1 },
        }),
      },
    }),
  });
  const settings = {
    workspaceSource: { kind: "ephemeral" as const },
    runtime: { directory: join(root, "runtime") },
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    brief: { text: "test" },
    observation,
    logging: false as const,
    redact: [/private/g],
  };
  const result = await dispatch({ ...settings, runId: "file" });
  assert.equal(result.runId, "file");
  assert.equal(result.observationId, "file");
  assert.deepEqual(result.reportData, JSON.parse(result.report()));
  assert.doesNotMatch(JSON.stringify(result.reportData), /private/);
  assert.equal(result.reportData.usage.input, 1);
  assert.equal((await observation.readRun("file"))?.status, "done");
  await assert.rejects(
    dispatch({
      ...settings,
      runId: "allocation",
      sandboxProvider: {
        ...settings.sandboxProvider,
        workspaces: {
          ...settings.sandboxProvider.workspaces!,
          async acquire() {
            throw new Error("allocation refused");
          },
        },
      },
    }),
    /allocation refused/,
  );
  assert.equal((await observation.readRun("allocation"))?.status, "failed");
  const { mkdir, writeFile } = await import("node:fs/promises");
  const source = join(root, "source");
  const destination = join(root, "published");
  await mkdir(source);
  await writeFile(join(source, "result.txt"), "agent output");
  const publishingAgent = createAgent({
    model: "offline",
    harness: createHarness({
      modelProvider: {
        name: "offline",
        async request() {
          await mkdir(destination);
          await writeFile(
            join(destination, "result.txt"),
            "concurrent host edit",
          );
          return { text: "ok", usage: { input: 1, cached: 0, output: 1 } };
        },
      },
    }),
  });
  await assert.rejects(
    dispatch({
      ...settings,
      agent: publishingAgent,
      workspaceSource: {
        kind: "directory",
        directory: source,
        access: { mode: "copy" },
      },
      runId: "publication",
      outputs: [{ paths: ["result.txt"], destination, policy: "create" }],
    }),
  );
  assert.equal((await observation.readRun("publication"))?.status, "failed");
});

test(
  "a stalled storage write cannot hold execution cleanup indefinitely",
  { timeout: 10_000 },
  async (t) => {
    const root = await repository(t);
    const storage = createLocalTransport({ directory: join(root, "store") });
    const stalled = barrier();
    const transporter: Transport = {
      ...storage,
      async write(key, bytes, settings) {
        if (key.includes("/events/")) {
          await stalled.promise;
          throw new Error("storage stopped");
        }
        return storage.write(key, bytes, settings);
      },
    };
    const observation = createObservation({
      transporter,
      deliveryTimeoutMs: 30,
    });
    try {
      const result = await defineWorkflow("stalled", []).start({ observation });
      assert.equal(result.status, "done");
      assert.ok(result.observerErrors.length);
      assert.ok(
        observation.errors.some(
          (error) =>
            error instanceof Error && /cleanup timed out/.test(error.message),
        ),
      );
      await observation.close();
    } finally {
      stalled.release();
      await observation.close();
    }
  },
);

test("closing a scoped client waits for descendants and refuses their next executions", async (t) => {
  const root = await repository(t);
  await using observation = createObservation({
    transporter: createLocalTransport({ directory: join(root, "store") }),
  });
  const parent = observation.child({});
  const child = parent.child({});
  const entered = barrier();
  const finish = barrier();
  const workflow = defineWorkflow("descendant", [
    defineTask({
      key: "wait",
      async perform() {
        entered.release();
        await finish.promise;
      },
    }),
  ]);
  const running = workflow.start({ observation: { ...child } });
  await entered.promise;
  let closed = false;
  const closing = parent.close().then(() => {
    closed = true;
  });
  assert.equal(closed, false);
  await assert.rejects(workflow.start({ observation: child }), /closed/);
  finish.release();
  await running;
  await closing;
  assert.equal(closed, true);
});

test("changing the YAML observation ID preserves the durable recipe identity", async (t) => {
  const { writeFile } = await import("node:fs/promises");
  const { createRecipeRuntime } = await import("../../src/recipes.ts");
  const root = await repository(t);
  const file = join(root, "recipe.yaml");
  const config = join(root, "outpost.yaml");
  const document = (runId: string) => ({
    version: 3,
    name: "durable-observation",
    workflow: {
      runId,
      checkpoint: {
        store: { $ref: "stores.checkpoint" },
        runId: "checkpoint",
        version: "1",
      },
    },
    tasks: [
      {
        key: "once",
        command: {
          executable: process.execPath,
          arguments: ["-e", "console.log('done')"],
        },
      },
    ],
  });
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: root,
      branch: { mode: "named", name: "observed" },
      sandbox: { provider: "local" },
      transports: { state: { type: "local", directory: "./storage" } },
      stores: {
        checkpoint: {
          type: "transport",
          transporter: { $ref: "transports.state" },
        },
      },
      observation: { transporter: { $ref: "transports.state" } },
    }),
  );
  await writeFile(file, JSON.stringify(document("first")));
  await using first = await createRecipeRuntime({ file, config });
  const result = await first.run();
  assert.equal(result.status, "done", JSON.stringify(result.errors));
  assert.equal(result.runId, "checkpoint");
  assert.equal(result.observationId, "first");
  await first.close();
  await writeFile(file, JSON.stringify(document("second")));
  await using resumed = await createRecipeRuntime({ file, config });
  const next = await resumed.resume({ runId: "checkpoint" });
  assert.equal(next.status, "done", JSON.stringify(next.errors));
  assert.equal(next.executionId, result.executionId);
  assert.equal(next.runId, "checkpoint");
  assert.equal(next.observationId, "second");
  assert.equal(next.tasks[0]?.attempts, 1);
});

test("tracking IDs stay independent of checkpoint and execution IDs", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  await using observation = createObservation({ transporter });
  const checkpoint = {
    store: createWorkflowCheckpointStore({ transporter }),
    runId: "checkpoint",
    version: "1",
  };
  let calls = 0;
  const workflow = defineWorkflow("identities", [
    defineTask({ key: "once", perform: () => ++calls }),
  ]);
  const first = await workflow.start({
    observation,
    checkpoint,
    runId: "tracking-one",
  });
  const second = await workflow.start({
    observation,
    checkpoint,
    runId: "tracking-two",
  });
  assert.equal(calls, 1);
  assert.equal(first.observationId, "tracking-one");
  assert.equal(second.observationId, "tracking-two");
  assert.equal(first.executionId, second.executionId);
  assert.equal(await observation.readRun("checkpoint"), undefined);
  assert.equal(
    (await observation.readRun(second.observationId!))?.executionId,
    second.executionId,
  );
  const unobserved = await workflow.start({ checkpoint });
  assert.equal(unobserved.observationId, undefined);
  assert.equal(unobserved.runId, undefined);
  assert.equal(unobserved.executionId, first.executionId);
});
