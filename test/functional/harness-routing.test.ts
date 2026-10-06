import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  defineDecision,
  defineHarnessModelRouting,
  defineHarnessHook,
  defineHarnessTool,
  defineHarnessSubagent,
  defineHarnessContextStrategy,
  dispatch,
  OutpostError,
  createObservationHub,
  createReplayAgent,
  readJournal,
  createLocalTransport,
  createSandbox,
  defineTextResponse,
  defineIsolatedTask,
  defineWorkflow,
} from "../../src/index.ts";
import type {
  DecisionProvider,
  DecisionProviderResult,
  ModelProvider,
  ModelRequest,
  AgentObservation,
  Observation,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { parseTranscript } from "../../src/domain/transcript.ts";
import { repository } from "../helpers.ts";

const decision = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions: "Select",
      criteria: { fast: "Simple", deep: "Complex" },
    },
  },
});
const chosen = (
  choice = "fast",
  confidence = 0.95,
): DecisionProviderResult => ({
  model: "router",
  answers: {
    route: {
      type: "choice",
      choice,
      confidence,
      probabilities:
        choice === "fast"
          ? { fast: 0.99, deep: 0.01 }
          : { fast: 0.01, deep: 0.99 },
    },
  },
  usage: { input: 2, cached: 0, output: 1 },
});
const routing = (provider: DecisionProvider) =>
  defineHarnessModelRouting({
    provider,
    model: "router",
    decision,
    question: "route",
    models: {
      fast: { name: "small", maxOutputTokens: 12 },
      deep: { name: "large", reasoning: "high", maxOutputTokens: 30 },
    },
    fallback: "deep",
  });

test("routing changes the effective model, preserves history, hooks, tools and transcript replay", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  const routes: AgentObservation[] = [];
  const observations: Observation[] = [];
  const contextModels: string[] = [];
  const compactModels: string[] = [];
  let evaluations = 0;
  const router: DecisionProvider = {
    name: "router",
    request: async (request) => {
      evaluations++;
      const state = JSON.parse(JSON.stringify(request.state));
      assert.equal(state.system, "Instruction");
      assert.ok(
        state.messages.every((message: { content: { type: string }[] }) =>
          message.content.every((block) => block.type !== "reasoning"),
        ),
      );
      if (evaluations === 2)
        assert.ok(JSON.stringify(state.messages).includes("tool failed"));
      return chosen(evaluations === 1 ? "fast" : "deep");
    },
  };
  const modelProvider: ModelProvider = {
    name: "models",
    request: async () => {
      throw new Error("stream expected");
    },
    stream: async function* (request) {
      requests.push(request);
      if (requests.length === 1) {
        yield {
          type: "result",
          result: {
            text: "",
            stopReason: "tool-calls",
            content: [
              {
                type: "reasoning",
                provider: "models",
                model: "small",
                data: { opaque: "private" },
              },
              { type: "tool-call", id: "call", name: "inspect", input: {} },
            ],
            usage: { input: 5, cached: 0, output: 2 },
          },
        };
        return;
      }
      yield { type: "text-delta", text: "done" };
      yield {
        type: "result",
        result: {
          text: "<outpost>done</outpost>",
          usage: { input: 5, cached: 0, output: 2 },
        },
      };
    },
  };
  const worker = createAgent({
    model: { name: "initial", reasoning: "max", maxOutputTokens: 100 },
    harness: createHarness({
      modelProvider,
      routing: routing(router),
      instructions: "Instruction",
      tools: [
        defineHarnessTool({
          name: "inspect",
          description: "Inspect",
          input: { type: "object" },
          execute: (_, context) => {
            contextModels.push(context.model.name);
            return { content: "tool failed", isError: true };
          },
        }),
      ],
      hooks: [
        defineHarnessHook({
          on: "before-model",
          run: ({ model }) => {
            contextModels.push(model.name);
          },
        }),
      ],
      context: defineHarnessContextStrategy({
        name: "observe",
        compact: ({ model }) => {
          compactModels.push(model.name);
          return undefined;
        },
      }),
    }),
  });
  const observation = createObservationHub({
    verbose: true,
    sinks: [
      {
        observe: (event) => {
          observations.push(event);
        },
      },
    ],
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: worker,
    brief: { text: "work" },
    observation,
    observe: (event) => {
      if (event.kind === "model-route") routes.push(event);
    },
    logging: { replayable: true, verbose: true },
  });
  assert.equal(result.completed, true);
  assert.equal(requests[0]?.model, "small");
  assert.equal(requests[0]?.reasoning, undefined);
  assert.equal(requests[0]?.maxOutputTokens, 12);
  assert.equal(requests[1]?.model, "large");
  assert.equal(requests[1]?.reasoning, "high");
  assert.equal(requests[1]?.maxOutputTokens, 30);
  assert.deepEqual(contextModels, ["small", "small", "large"]);
  assert.deepEqual(compactModels, ["initial", "small"]);
  assert.equal(worker.model.name, "initial");
  assert.equal(result.usage.input, 14);
  assert.equal(result.usage.output, 6);
  assert.equal(
    observations.filter(
      (event) =>
        event.source === "decision" &&
        event.event.kind === "decision" &&
        event.event.status === "finished",
    ).length,
    2,
  );
  const records = parseTranscript(await readFile(result.transcript!, "utf8"));
  assert.ok(records[0]?.type === "session" && records[0].version === 2);
  assert.equal(
    records.filter((record) => record.type === "model-selection").length,
    2,
  );
  const journal = await readJournal({
    reference: result.logReference!,
    transporter: createLocalTransport({
      directory: join(root, ".outpost", "storage"),
    }),
  });
  const replay = createReplayAgent({ journal });
  const replayObservations: Observation[] = [];
  const replayObservation = createObservationHub({
    verbose: true,
    sinks: [
      {
        observe: (value) => {
          replayObservations.push(value);
        },
      },
    ],
  });
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: replay,
    observation: replayObservation,
    brief: { text: "work" },
    observe: (event) => {
      if (event.kind === "model-route") routes.push(event);
    },
    logging: false,
  });
  assert.equal(replayed.completed, true);
  assert.equal(evaluations, 2);
  assert.equal(routes.length, 4);
  assert.deepEqual(
    replayObservations
      .filter((value) => value.source === "decision")
      .map((value) => value.event),
    observations
      .filter((value) => value.source === "decision")
      .map((value) => value.event),
  );
  assert.equal(replayed.usage.input, 14);
  assert.equal(requests.length, 2);
  await replayObservation.close();
  const quiet: Observation[] = [];
  const quietObservation = createObservationHub({
    sinks: [
      {
        observe: (value) => {
          quiet.push(value);
        },
      },
    ],
  });
  await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: createReplayAgent({ journal }),
    observation: quietObservation,
    brief: { text: "work" },
    logging: false,
  });
  assert.equal(quiet.filter((value) => value.source === "decision").length, 4);
  assert.ok(
    quiet
      .filter((value) => value.source === "decision")
      .every((value) => value.event.kind === "decision"),
  );
  await quietObservation.close();
  await observation.close();
});

test("routing falls back only for low confidence, timeouts and unavailable faults", async (t) => {
  const root = await repository(t);
  for (const fault of [
    undefined,
    new OutpostError("timeout", "slow"),
    new OutpostError("provider", "down", { unavailable: "down" }),
  ]) {
    let used = "";
    const provider: DecisionProvider = {
      name: "router",
      request: async () => {
        if (fault) throw fault;
        return chosen("fast", 0.5);
      },
    };
    const worker = createAgent({
      model: "initial",
      harness: createHarness({
        routing: routing(provider),
        modelProvider: {
          name: "models",
          request: async (request) => {
            used = request.model;
            return { text: "<outpost>done</outpost>" };
          },
        },
      }),
    });
    const result = await dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: worker,
      brief: { text: "work" },
      logging: false,
    });
    assert.equal(result.completed, true);
    assert.equal(used, "large");
    if (fault) assert.equal(result.usage.complete, false);
  }
  for (const fault of [
    new OutpostError("quota", "quota"),
    new OutpostError("aborted", "cancelled"),
    new OutpostError("response", "invalid"),
    new OutpostError("configuration", "invalid"),
  ]) {
    let calls = 0;
    const worker = createAgent({
      model: "initial",
      harness: createHarness({
        routing: routing({
          name: "router",
          request: async () => {
            throw fault;
          },
        }),
        modelProvider: {
          name: "models",
          request: async () => {
            calls++;
            return { text: "done" };
          },
        },
      }),
    });
    await assert.rejects(
      dispatch({
        repository: root,
        sandboxProvider: createLocalSandboxProvider(),
        agent: worker,
        brief: { text: "work" },
        logging: false,
      }),
      (error: unknown) => error === fault,
    );
    assert.equal(calls, 0);
  }
});

test("routing rejects truncated states after accounting and supports explicit fail policy", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  let calls = 0;
  const router: DecisionProvider = {
    name: "router",
    request: async () => ({ ...chosen(), truncated: true }),
  };
  const worker = createAgent({
    model: "initial",
    harness: createHarness({
      routing: routing(router),
      modelProvider: {
        name: "models",
        request: async () => {
          calls++;
          return { text: "done" };
        },
      },
    }),
  });
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: worker,
      brief: { text: "work" },
      logging: false,
      observe: (event) => {
        events.push(event);
      },
    }),
    /truncated/,
  );
  assert.equal(calls, 0);
  assert.equal(events.filter((event) => event.kind === "usage").length, 1);
  const policy = defineHarnessModelRouting({
    provider: {
      name: "router",
      request: async () => {
        throw new OutpostError("timeout", "slow");
      },
    },
    model: "router",
    decision,
    question: "route",
    models: { fast: "small", deep: "large" },
    fallback: "deep",
    onError: "fail",
    state: ({ step }) => ({ step }),
  });
  const strict = createAgent({
    model: "initial",
    harness: createHarness({
      routing: policy,
      modelProvider: {
        name: "models",
        request: async () => ({ text: "done" }),
      },
    }),
  });
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: strict,
      brief: { text: "work" },
      logging: false,
    }),
    /slow/,
  );
});

test("subagent routing adds its decisions to ancestor token budgets", async (t) => {
  const root = await repository(t);
  const child = createAgent({
    model: "initial",
    harness: createHarness({
      routing: routing({ name: "router", request: async () => chosen() }),
      modelProvider: {
        name: "child-model",
        request: async () => ({
          text: "child done",
          usage: { input: 3, cached: 0, output: 1 },
        }),
      },
    }),
  });
  let calls = 0;
  const parent = createAgent({
    model: "parent",
    harness: createHarness({
      tools: [
        defineHarnessSubagent({
          name: "child",
          description: "Child",
          agent: child,
        }),
      ],
      limits: { usage: { input: 4 } },
      modelProvider: {
        name: "parent-model",
        request: async () => {
          calls++;
          return {
            text: "",
            stopReason: "tool-calls",
            content: [
              {
                type: "tool-call",
                id: "delegate",
                name: "child",
                input: { prompt: "work" },
              },
            ],
            usage: { input: 1, cached: 0, output: 1 },
          };
        },
      },
    }),
  });
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: parent,
      brief: { text: "work" },
      logging: false,
    }),
    /token budget/,
  );
  assert.equal(calls, 1);
});

test("routed conversations resume and fork without replaying completed steps", async (t) => {
  const root = await repository(t);
  let evaluations = 0;
  const requests: ModelRequest[] = [];
  const worker = createAgent({
    model: "initial",
    harness: createHarness({
      routing: routing({
        name: "router",
        request: async () => {
          evaluations++;
          return chosen();
        },
      }),
      modelProvider: {
        name: "models",
        request: async (request) => {
          requests.push(request);
          return { text: "<outpost>done</outpost>" };
        },
      },
    }),
  });
  const base = {
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: worker,
    logging: false as const,
  };
  const first = await dispatch({ ...base, brief: { text: "first" } });
  const original = await readFile(first.transcript!, "utf8");
  const forked = await dispatch({
    ...base,
    continuation: { id: first.conversation!, fork: true },
    brief: { text: "fork" },
  });
  assert.notEqual(forked.conversation, first.conversation);
  assert.equal(await readFile(first.transcript!, "utf8"), original);
  const resumed = await dispatch({
    ...base,
    continuation: { id: first.conversation! },
    brief: { text: "resume" },
  });
  assert.equal(resumed.conversation, first.conversation);
  assert.equal(evaluations, 3);
  assert.equal(requests.at(-1)?.messages?.length, 3);
});

test("compaction uses the previous model before routing and workflow usage survives observer failures", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  let evaluations = 0;
  const router: DecisionProvider = {
    name: "router",
    request: async ({ state }) => {
      evaluations++;
      if (evaluations === 2) {
        assert.ok(JSON.stringify(state).includes("compacted tool result"));
        assert.ok(!JSON.stringify(state).includes('"tool-call"'));
      }
      return chosen(evaluations === 1 ? "fast" : "deep");
    },
  };
  const agent = createAgent({
    model: "initial",
    harness: createHarness({
      routing: routing(router),
      context: defineHarnessContextStrategy({
        name: "summarize",
        compact: async ({ step, messages, summarize }) =>
          step === 2
            ? [
                {
                  role: "user",
                  content: [{ type: "text", text: await summarize(messages) }],
                },
              ]
            : undefined,
      }),
      tools: [
        defineHarnessTool({
          name: "inspect",
          description: "Inspect",
          input: { type: "object" },
          execute: () => "tool result",
        }),
      ],
      modelProvider: {
        name: "models",
        request: async (request) => {
          requests.push(request);
          const usage = { input: 3, cached: 0, output: 1 };
          if (request.prompt) return { text: "compacted tool result", usage };
          if (requests.length === 1)
            return {
              text: "",
              usage,
              stopReason: "tool-calls",
              content: [
                { type: "tool-call", id: "call", name: "inspect", input: {} },
              ],
            };
          return { text: "<outpost>done</outpost>", usage };
        },
      },
    }),
  });
  const observation = createObservationHub({
    sinks: [
      {
        observe() {
          throw new Error("sink failed");
        },
      },
    ],
  });
  const task = defineIsolatedTask({
    key: "work",
    request: () => ({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent,
      brief: { text: "work" },
      logging: false,
    }),
  });
  const result = await defineWorkflow("routed", [task]).start({ observation });
  result.unwrap();
  assert.deepEqual(
    requests.map((request) => request.model),
    ["small", "small", "large"],
  );
  assert.equal(requests[1]?.maxOutputTokens, 12);
  assert.equal(requests[1]?.reasoning, undefined);
  assert.equal(result.usage.tokens.input, 13);
  assert.equal(result.usage.tokens.output, 5);
  await observation.close();
});

test("response repairs make a fresh routing decision over the captured conversation", async (t) => {
  const root = await repository(t);
  let evaluations = 0;
  const models: string[] = [];
  const agent = createAgent({
    model: "initial",
    harness: createHarness({
      routing: routing({
        name: "router",
        request: async ({ state }) => {
          evaluations++;
          if (evaluations === 2)
            assert.ok(JSON.stringify(state).includes("first invalid answer"));
          return chosen(evaluations === 1 ? "fast" : "deep");
        },
      }),
      modelProvider: {
        name: "models",
        request: async ({ model }) => {
          models.push(model);
          return {
            text:
              models.length === 1 ? "first invalid answer" : "<x>repaired</x>",
            usage: { input: 3, cached: 0, output: 1 },
          };
        },
      },
    }),
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    brief: { text: "Return your answer in <x></x>." },
    response: defineTextResponse({ tag: "x", repairs: 1 }),
    logging: false,
  });
  assert.equal(result.value, "repaired");
  assert.deepEqual(models, ["small", "large"]);
  assert.equal(evaluations, 2);
  assert.equal(result.usage.input, 10);
});

test("router cancellation waits for request termination and leaves the warm sandbox reusable", async (t) => {
  const root = await repository(t);
  const controller = new AbortController();
  let ready!: () => void;
  const started = new Promise<void>((resolve) => {
    ready = resolve;
  });
  let finished = false;
  let calls = 0;
  const agent = createAgent({
    model: "initial",
    harness: createHarness({
      routing: routing({
        name: "router",
        request: async ({ signal }) => {
          assert.ok(signal);
          ready();
          await new Promise<void>((resolve) =>
            signal.addEventListener("abort", () => setTimeout(resolve, 15), {
              once: true,
            }),
          );
          finished = true;
          return chosen();
        },
      }),
      modelProvider: {
        name: "models",
        request: async () => {
          calls++;
          return { text: "<outpost>done</outpost>" };
        },
      },
    }),
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  const pending = sandbox.dispatch({
    agent,
    brief: { text: "wait" },
    signal: controller.signal,
  });
  const rejected = assert.rejects(pending);
  await started;
  controller.abort();
  await rejected;
  assert.equal(finished, true);
  assert.equal(calls, 0);
  const reused = await sandbox.dispatch({
    agent: createAgent({
      model: "plain",
      harness: createHarness({
        modelProvider: {
          name: "models",
          request: async () => ({ text: "<outpost>done</outpost>" }),
        },
      }),
    }),
    brief: { text: "reuse" },
  });
  assert.equal(reused.completed, true);
});

test("strict routing budgets reject unknown consumption and legacy transcripts upgrade on resume", async (t) => {
  const root = await repository(t);
  let calls = 0;
  const modelProvider: ModelProvider = {
    name: "models",
    request: async () => {
      calls++;
      return {
        text: "<outpost>done</outpost>",
        usage: { input: 1, cached: 0, output: 1 },
      };
    },
  };
  const base = {
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    brief: { text: "work" },
    logging: false as const,
  };
  const legacy = await dispatch({
    ...base,
    agent: createAgent({
      model: "initial",
      harness: createHarness({ modelProvider }),
    }),
  });
  assert.ok(
    parseTranscript(await readFile(legacy.transcript!, "utf8"))[0]?.type ===
      "session",
  );
  const worker = createAgent({
    model: "initial",
    harness: createHarness({
      modelProvider,
      routing: routing({ name: "router", request: async () => chosen() }),
    }),
  });
  const resumed = await dispatch({
    ...base,
    agent: worker,
    continuation: { id: legacy.conversation! },
  });
  const records = parseTranscript(await readFile(resumed.transcript!, "utf8"));
  assert.ok(records[0]?.type === "session" && records[0].version === 2);
  assert.equal(records.filter((record) => record.type === "message").length, 4);
  const strict = createAgent({
    model: "initial",
    harness: createHarness({
      modelProvider,
      limits: { usage: { input: 20 } },
      routing: routing({
        name: "router",
        request: async () => {
          throw new OutpostError("provider", "down", { unavailable: "down" });
        },
      }),
    }),
  });
  await assert.rejects(
    dispatch({ ...base, agent: strict }),
    /reports usage completely/,
  );
  assert.equal(calls, 2);
});
