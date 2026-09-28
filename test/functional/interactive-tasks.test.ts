import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  agent,
  harness,
  interactiveAgentTask,
  localTransport,
  workflowCheckpointStore,
  workflow,
  task,
  antigravityHarness,
  codexHarness,
  claudeHarness,
  copilotHarness,
  kimiHarness,
} from "../../src/index.ts";
import type {
  WorkflowResult,
  WorkflowAnswer,
  TaskContext,
  ModelProvider,
  WorkflowCheckpointStore,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository, scripted } from "../helpers.ts";

const checkpointFor = (directory: string) => ({
  store: workflowCheckpointStore({
    transporter: localTransport({
      directory: join(directory, ".outpost", "storage"),
    }),
  }),
  runId: "input",
  version: "1",
});
const answerFor = (
  result: WorkflowResult,
  value = "clothes",
): WorkflowAnswer => ({
  executionId: result.executionId,
  key: result.inputRequests[0]!.key,
  requestId: result.inputRequests[0]!.id,
  actor: "owner",
  value,
});
const definition = {
  key: "ask",
  interaction: { identity: "v1", actors: ["owner"] },
};
const question = {
  question: "Product?",
  choices: ["clothes", "books"],
  allowFreeText: false,
};

test("interactive workflow survives separate processes and asks adaptive questions without replay", async (t) => {
  const repo = await repository(t);
  async function run(answer?: unknown) {
    const result = await executeProcess({
      executable: process.execPath,
      arguments: [
        resolve("test/fixtures/interactive-workflow.ts"),
        repo,
        ...(answer ? [JSON.stringify(answer)] : []),
      ],
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  }
  const first = await run();
  assert.equal(first.status, "waiting-input");
  assert.equal(first.inputRequests[0].question, "What are you selling?");
  const polled = await run();
  assert.deepEqual(polled, first);
  const second = await run({
    executionId: first.executionId,
    key: "interview",
    requestId: first.inputRequests[0].id,
    actor: "owner",
    value: "clothes",
  });
  assert.equal(second.inputRequests[0].question, "Which sizes for clothes?");
  assert.notEqual(second.inputRequests[0].id, first.inputRequests[0].id);
  const last = await run({
    executionId: first.executionId,
    key: "interview",
    requestId: second.inputRequests[0].id,
    actor: "owner",
    value: "medium",
  });
  assert.equal(last.status, "done", JSON.stringify(last));
  assert.deepEqual(last.value.output, { product: "clothes", size: "medium" });
  assert.equal(last.value.turns, 3);
  assert.deepEqual(last.usage, {
    attempts: 3,
    tokens: { input: 12, cached: 0, output: 6 },
  });
  assert.ok((await stat(last.value.directory)).isDirectory());
  assert.deepEqual(await run(), last);
});

test("input pauses drain independent tasks, preserve values and block dependent effects", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  let setups = 0,
    deliveries = 0;
  const build = () => {
    const source = task({ key: "source", perform: () => ++setups });
    const ask = task({
      ...definition,
      after: [source],
      perform(context) {
        if (!context.interaction!.state)
          return context.interaction!.suspend(question, {
            source: context.value(source),
          });
        return context.interaction!.answer!.value;
      },
    });
    const deliver = task({
      key: "deliver",
      after: [ask],
      perform(context) {
        deliveries++;
        return context.value(ask);
      },
    });
    const independent = task({ key: "independent", perform: () => true });
    return {
      graph: workflow("input", [source, ask, deliver, independent]),
      deliver,
    };
  };
  const initial = await build().graph.start({ checkpoint });
  assert.equal(initial.status, "waiting-input");
  assert.equal(
    initial.tasks.find((item) => item.key === "independent")!.status,
    "done",
  );
  assert.equal(deliveries, 0);
  assert.throws(() => initial.unwrap());
  const next = build();
  const result = await next.graph.start({
    checkpoint,
    answers: [answerFor(initial)],
  });
  result.unwrap();
  assert.equal(result.value(next.deliver), "clothes");
  assert.equal(setups, 1);
  assert.equal(deliveries, 1);
  await assert.rejects(
    next.graph.start({ checkpoint, answers: [answerFor(initial)] }),
    /Stale/,
  );
});

test("answers reject wrong execution, actor, choices, stale IDs and duplicates without consuming input", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  const item = task({
    ...definition,
    perform(context) {
      return context.interaction!.suspend(question, {});
    },
  });
  const graph = workflow("input", [item]);
  const initial = await graph.start({ checkpoint });
  for (const changes of [
    { executionId: "other" },
    { actor: "stranger" },
    { value: "toys" },
    { value: "" },
    { requestId: "stale" },
    { key: "unknown" },
  ]) {
    await assert.rejects(
      graph.start({
        checkpoint,
        answers: [{ ...answerFor(initial), ...changes }],
      }),
      /answer/,
    );
    assert.deepEqual(
      (await graph.start({ checkpoint })).inputRequests,
      initial.inputRequests,
    );
  }
  await assert.rejects(
    graph.start({
      checkpoint,
      answers: [answerFor(initial), answerFor(initial)],
    }),
    /duplicate/,
  );
  await assert.rejects(graph.start({ checkpoint, answers: [] }), /empty/);
  await assert.rejects(graph.start(), /checkpoint/);
  const changed = task({
    ...definition,
    interaction: { identity: "v1", actors: ["other"] },
    perform: () => null,
  });
  await assert.rejects(
    workflow("input", [changed]).start({ checkpoint }),
    /incompatible/,
  );
});

test("accepted answers persist before execution and interrupted turns require explicit replay", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  let fail = true;
  const item = task({
    ...definition,
    perform(context) {
      const interaction = context.interaction!;
      if (!interaction.state)
        return interaction.suspend(question, { ready: true });
      assert.equal(interaction.answer!.value, "clothes");
      if (fail) throw new Error("interrupted turn");
      return "completed";
    },
  });
  const graph = workflow("input", [item]);
  const first = await graph.start({ checkpoint });
  const failure = await graph.start({
    checkpoint,
    answers: [answerFor(first)],
  });
  assert.equal(failure.status, "failed");
  await assert.rejects(graph.start({ checkpoint }), /retry-incomplete/);
  fail = false;
  const recovered = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  recovered.unwrap();
  assert.equal(recovered.usage.attempts, 3);
});

test("interaction state is immutable and invalid checkpoints are rejected", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  let retained: TaskContext | undefined;
  const item = task({
    ...definition,
    perform(context) {
      retained = context;
      return context.interaction!.suspend(
        { question: "Free text?" },
        { nested: [1] },
      );
    },
  });
  const graph = workflow("input", [item]);
  const first = await graph.start({ checkpoint });
  assert.throws(() => {
    Object.assign(first.tasks[0]!.interaction!.state!, { nested: [] });
  }, TypeError);
  await assert.rejects(retained!.interaction!.save({ late: true }), /active/);
  const lease = await checkpoint.store.acquire(checkpoint.runId);
  const raw = await lease.read();
  await lease.release();
  const corrupt = structuredClone(raw) as {
    records: { interaction: { request: { id: string }; answer?: object } }[];
  };
  corrupt.records[0]!.interaction.request.id = "";
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return corrupt;
        },
        async write() {},
        async release() {},
      };
    },
  };
  await assert.rejects(
    graph.start({ checkpoint: { ...checkpoint, store } }),
    /interaction/,
  );
});

test("CLI adapters use the same durable turn protocol and retain uncommitted workspace files", async (t) => {
  const repo = await repository(t);
  const transcript = join(repo, ".outpost", "fixture.json");
  const makeAgent = () => ({
    ...scripted(
      (input) => `
    import { readFileSync, writeFileSync } from 'node:fs';
    const count = ${input.continuation ? 1 : 0};
    if (count) {
      if (${JSON.stringify(input.continuation?.id)} !== 'dialogue') throw Error('wrong conversation');
      if (readFileSync('draft.txt', 'utf8') !== 'draft') throw Error('workspace lost');
      if (!${JSON.stringify(input.text)}.includes('clothes')) throw Error('answer lost');
    } else writeFileSync('draft.txt', 'draft');
    const value = count ? { kind: 'completed', output: 'ready' } : { kind: 'question', question: 'Product?' };
    console.log(JSON.stringify({ kind: 'conversation', id: 'dialogue' }));
    console.log(JSON.stringify({ kind: 'text', text: '<interaction>' + JSON.stringify(value) + '</interaction>' }));
    console.log(JSON.stringify({ kind: 'usage', tokens: { input: 1, cached: 0, output: 1 } }));
    console.log(JSON.stringify({ kind: 'finished' }));
  `,
    ),
    storage: {
      name: "fixture",
      async locate(id: string) {
        await readFile(transcript);
        return { id, file: transcript, format: "fixture" };
      },
      async capture(id: string) {
        await writeFile(transcript, "{}");
        return { id, file: transcript, format: "fixture" };
      },
      async restore() {},
    },
  });
  const build = () =>
    interactiveAgentTask({
      key: "cli",
      repository: repo,
      agent: makeAgent(),
      brief: "Interview",
      actors: ["owner"],
      sandboxProvider: localSandboxProvider(),
      bootstrap: false,
    });
  const checkpoint = checkpointFor(repo);
  const initial = await workflow("cli", [build()]).start({ checkpoint });
  assert.equal(
    initial.status,
    "waiting-input",
    initial.errors.map(String).join(),
  );
  const next = build();
  const result = await workflow("cli", [next]).start({
    checkpoint,
    answers: [answerFor(initial)],
  });
  result.unwrap();
  assert.equal(result.value(next).output, "ready");
  assert.equal(
    await readFile(join(result.value(next).directory, "draft.txt"), "utf8"),
    "draft",
  );
  assert.equal(await readFile(join(repo, "base.txt"), "utf8"), "base\n");
});

test("portable presets are admitted and unsupported capture is rejected before allocation", () => {
  const options = {
    key: "ask",
    repository: "/repo",
    brief: "Ask",
    actors: ["owner"],
  };
  for (const preset of [
    codexHarness,
    claudeHarness,
    copilotHarness,
    kimiHarness,
  ]) {
    assert.ok(
      interactiveAgentTask({
        ...options,
        agent: agent({ harness: preset({ authentication: "account" }) }),
      }),
    );
  }
  assert.throws(
    () =>
      interactiveAgentTask({
        ...options,
        agent: agent({
          harness: antigravityHarness({ authentication: "account" }),
        }),
      }),
    /portable/,
  );
  assert.throws(
    () =>
      interactiveAgentTask({
        ...options,
        agent: agent({
          harness: codexHarness({
            authentication: "account",
            saveConversations: false,
          }),
        }),
      }),
    /portable/,
  );
  assert.throws(
    () =>
      interactiveAgentTask({ ...options, maxTurns: 0, agent: scripted("") }),
    /maxTurns/,
  );
});

test("turn limits and cancellation stop model execution while retaining recoverable state", async (t) => {
  const repo = await repository(t);
  let calls = 0;
  const modelProvider: ModelProvider = {
    name: "limited",
    async request() {
      calls++;
      const text =
        '<interaction>{"kind":"question","question":"Again?"}</interaction>';
      return {
        text,
        content: [{ type: "text", text }],
        stopReason: "end",
        usage: { input: 2, cached: 0, output: 1 },
      };
    },
  };
  const item = interactiveAgentTask({
    key: "ask",
    repository: repo,
    brief: "Ask",
    actors: ["owner"],
    maxTurns: 1,
    bootstrap: false,
    sandboxProvider: localSandboxProvider(),
    agent: agent({ model: "fixture", harness: harness({ modelProvider }) }),
  });
  const checkpoint = checkpointFor(repo);
  const graph = workflow("limit", [item]);
  const result = await graph.start({ checkpoint });
  assert.equal(result.status, "failed");
  assert.match(String(result.errors[0]), /maxTurns/);
  const retried = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  assert.equal(retried.status, "failed");
  assert.equal(calls, 1);
  const stopped = await workflow("abort", [item]).start({
    checkpoint: { ...checkpoint, runId: "abort" },
    signal: AbortSignal.abort(new Error("stop")),
  });
  assert.equal(stopped.status, "cancelled");
  assert.equal(calls, 1);
});

test("a batch containing an invalid answer consumes none of the independent requests", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  const make = (key: string) =>
    task({
      ...definition,
      key,
      perform(context) {
        if (context.interaction!.answer)
          return context.interaction!.answer.value;
        return context.interaction!.suspend({ question: key }, {});
      },
    });
  const left = make("left"),
    right = make("right");
  const graph = workflow("batch", [left, right]);
  const first = await graph.start({ checkpoint, concurrency: 2 });
  const answers = first.inputRequests.map((request) => ({
    executionId: first.executionId,
    key: request.key,
    requestId: request.id,
    actor: "owner",
    value: "answer",
  }));
  await assert.rejects(
    graph.start({
      checkpoint,
      answers: [answers[0]!, { ...answers[1]!, actor: "stranger" }],
    }),
    /unauthorized/,
  );
  assert.deepEqual(
    (await graph.start({ checkpoint })).inputRequests,
    first.inputRequests,
  );
  const results = await Promise.allSettled([
    graph.start({ checkpoint, answers }),
    graph.start({ checkpoint, answers }),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    1,
  );
  const final = await graph.start({ checkpoint });
  final.unwrap();
  assert.equal(final.usage.attempts, 4);
});

test("sandbox cleanup failure does not publish a question or corrupt recovery", async (t) => {
  const repo = await repository(t);
  const local = localSandboxProvider();
  let fail = true;
  const provider = {
    ...local,
    async acquire(context: Parameters<typeof local.acquire>[0]) {
      const lease = await local.acquire(context);
      return {
        ...lease,
        async release() {
          await lease.release();
          if (fail) throw new Error("cleanup failed");
        },
      };
    },
  };
  const modelProvider: ModelProvider = {
    name: "cleanup",
    async request() {
      const text =
        '<interaction>{"kind":"question","question":"Ready?"}</interaction>';
      return {
        text,
        content: [{ type: "text", text }],
        stopReason: "end",
        usage: { input: 1, cached: 0, output: 1 },
      };
    },
  };
  const item = interactiveAgentTask({
    key: "ask",
    repository: repo,
    brief: "Ask",
    actors: ["owner"],
    bootstrap: false,
    sandboxProvider: provider,
    agent: agent({ model: "fixture", harness: harness({ modelProvider }) }),
  });
  const graph = workflow("cleanup", [item]),
    checkpoint = checkpointFor(repo);
  const failed = await graph.start({ checkpoint });
  assert.equal(failed.status, "failed");
  assert.equal(failed.inputRequests.length, 0);
  await assert.rejects(graph.start({ checkpoint }), /retry-incomplete/);
  fail = false;
  const resumed = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  assert.equal(
    resumed.status,
    "waiting-input",
    resumed.errors.map(String).join(),
  );
});

test("a task deadline reaches an in-flight model and leaves an explicitly replayable checkpoint", async (t) => {
  const repo = await repository(t);
  let aborted = false;
  const modelProvider: ModelProvider = {
    name: "waiting",
    async request(request) {
      await new Promise<never>((_, reject) => {
        const stop = () => {
          aborted = true;
          reject(request.signal!.reason);
        };
        if (request.signal!.aborted) return stop();
        request.signal!.addEventListener("abort", stop, { once: true });
      });
      throw new Error("unreachable");
    },
  };
  const item = interactiveAgentTask({
    key: "ask",
    repository: repo,
    brief: "Ask",
    actors: ["owner"],
    timeoutMs: 5000,
    bootstrap: false,
    sandboxProvider: localSandboxProvider(),
    agent: agent({ model: "fixture", harness: harness({ modelProvider }) }),
  });
  const graph = workflow("deadline", [item]),
    checkpoint = checkpointFor(repo);
  const result = await graph.start({ checkpoint });
  assert.equal(result.status, "failed");
  assert.ok(aborted);
  assert.equal(result.inputRequests.length, 0);
  await assert.rejects(graph.start({ checkpoint }), /retry-incomplete/);
});

test("a failed cleanup after generic suspension keeps the checkpoint replayable", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  const item = task({
    ...definition,
    perform(context) {
      try {
        return context.interaction!.suspend(question, {});
      } finally {
        throw new Error("generic cleanup failed");
      }
    },
  });
  const graph = workflow("failed-suspend", [item]);
  const failed = await graph.start({ checkpoint });
  assert.equal(failed.status, "failed");
  assert.equal(failed.inputRequests.length, 0);
  await assert.rejects(graph.start({ checkpoint }), /retry-incomplete/);
});

test("closed attempts cannot write interaction state during retry backoff", async (t) => {
  const checkpoint = checkpointFor(await repository(t));
  let stale: TaskContext | undefined;
  let verification: Promise<void> | undefined;
  const item = task({
    ...definition,
    retry: { attempts: 2, delayMs: 100 },
    async perform(context) {
      if (context.attempt === 1) {
        stale = context;
        verification = new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            assert
              .rejects(stale!.interaction!.save({ stale: true }), /active/)
              .then(resolve, reject);
          }, 10);
        });
        void verification.catch(() => undefined);
        throw new Error("retry");
      }
      await verification;
      assert.equal(context.interaction!.state, undefined);
      return context.interaction!.suspend(question, {});
    },
  });
  const result = await workflow("fence", [item]).start({ checkpoint });
  assert.equal(result.status, "waiting-input");
});

test("a completed dialogue checkpoint is reused after finalization fails without another model call", async (t) => {
  const repo = await repository(t);
  let calls = 0,
    rejectFinalization = true;
  const item = interactiveAgentTask({
    key: "ask",
    repository: repo,
    brief: "Complete",
    actors: ["owner"],
    bootstrap: false,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "fixture",
      harness: harness({
        modelProvider: {
          name: "complete",
          async request() {
            calls++;
            const text =
              '<interaction>{"kind":"completed","output":"done"}</interaction>';
            return {
              text,
              content: [{ type: "text", text }],
              stopReason: "end",
              usage: { input: 1, cached: 0, output: 1 },
            };
          },
        },
      }),
    }),
  });
  const base = checkpointFor(repo);
  const store: WorkflowCheckpointStore = {
    async acquire(runId) {
      const lease = await base.store.acquire(runId);
      return {
        ...lease,
        async write(value) {
          if (rejectFinalization && value.records[0]!.status === "done")
            throw new Error("finalization failed");
          await lease.write(value);
        },
      };
    },
  };
  const checkpoint = { ...base, store },
    graph = workflow("finalize", [item]);
  await assert.rejects(graph.start({ checkpoint }), /finalization failed/);
  rejectFinalization = false;
  await assert.rejects(graph.start({ checkpoint }), /retry-incomplete/);
  const result = await graph.start({
    checkpoint: { ...checkpoint, resume: "retry-incomplete" },
  });
  result.unwrap();
  assert.equal(result.value(item).output, "done");
  assert.equal(calls, 1);
});

test("durable loops and interactive tasks compose without replaying completed rounds", async (t) => {
  const { loopTask } = await import("../../src/index.ts");
  const checkpoint = checkpointFor(await repository(t));
  let rounds = 0;
  const build = () => {
    const prepare = loopTask({
      key: "prepare",
      maxRounds: 2,
      attempt: (context) => {
        rounds++;
        return context.round;
      },
      check: (_, value) =>
        value === 2 ? { done: true } : { done: false, feedback: "Try again" },
    });
    const ask = task({
      ...definition,
      after: [prepare],
      perform(context) {
        assert.equal(context.value(prepare), 2);
        if (context.interaction!.answer)
          return context.interaction!.answer.value;
        return context.interaction!.suspend(question, { prepared: true });
      },
    });
    const verify = loopTask({
      key: "verify",
      after: [ask],
      maxRounds: 1,
      attempt: (context) => context.value(ask),
      check: () => ({ done: true }),
    });
    return { graph: workflow("composed", [prepare, ask, verify]), verify };
  };
  const initial = await build().graph.start({ checkpoint });
  assert.equal(initial.status, "waiting-input");
  const next = build();
  const final = await next.graph.start({
    checkpoint,
    answers: [answerFor(initial)],
  });
  final.unwrap();
  assert.equal(final.value(next.verify), "clothes");
  assert.equal(rounds, 2);
  assert.equal(final.usage.attempts, 5);
});
