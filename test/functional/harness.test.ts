import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  harness,
  codexHarness,
  claudeHarness,
  geminiHarness,
  defineHarnessInstructions,
  defineHarnessTool,
  dispatch,
  createSandbox,
  attach,
  response,
  type AgentObservation,
  type CustomHarnessOptions,
  type HarnessTool,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const done = "<outpost>done</outpost>";
const usage = { input: 4, cached: 1, output: 2 };

type Reply = (request: ModelRequest) => ModelResult | Promise<ModelResult>;

function scriptedProvider(replies: Reply[], requests: ModelRequest[] = []) {
  const provider: ModelProvider = {
    name: "scripted",
    async request(request) {
      request.signal?.throwIfAborted();
      requests.push(request);
      const reply = replies.shift();
      assert.ok(reply, "unexpected model request");
      return reply(request);
    },
  };
  return provider;
}

const answer =
  (text = done): Reply =>
  () => ({
    text,
    content: [{ type: "text", text }],
    stopReason: "end",
    usage,
  });

const call =
  (...calls: [name: string, input: unknown][]): Reply =>
  (request) => ({
    text: "",
    content: calls.map(([name, input], index) => ({
      type: "tool-call" as const,
      id: `call-${request.messages?.length ?? 0}-${index}`,
      name,
      input,
    })),
    stopReason: "tool-calls",
    usage,
  });

const echo = defineHarnessTool({
  name: "echo",
  description: "Return the provided text.",
  readOnly: true,
  input: {
    type: "object",
    properties: { text: { type: "string" } },
    required: ["text"],
    additionalProperties: false,
  },
  execute: (input: { text: string }) => input.text,
});

const developer = (
  modelProvider: ModelProvider,
  tools: HarnessTool[] = [echo],
  extra: Omit<CustomHarnessOptions, "modelProvider" | "tools"> = {},
) =>
  agent({
    model: "m",
    harness: harness({ modelProvider, tools, ...extra }),
  });

function resultContents(request: ModelRequest | undefined) {
  return (request?.messages?.at(-1)?.content ?? []).map((block) =>
    block.type === "tool-result" ? block.content : "",
  );
}

test("agents compose without effects and custom harnesses are declarative", () => {
  for (const preset of [codexHarness, claudeHarness, geminiHarness]) {
    const selected = agent({
      harness: preset(),
      model: "arbitrary-future-model",
    });
    assert.ok(
      selected
        .request({ text: "hello" })
        .arguments?.includes("arbitrary-future-model"),
    );
    assert.deepEqual(selected.model, { name: "arbitrary-future-model" });
    assert.equal(agent({ harness: preset() }).model, undefined);
    assert.throws(() => agent({ harness: preset(), model: " " }), /Model name/);
  }
  const provider = scriptedProvider([]);
  const configured = harness({ modelProvider: provider });
  assert.deepEqual(configured.tools, []);
  assert.deepEqual(configured.limits, { maxSteps: 100 });
  assert.deepEqual(configured.toolExecution, {
    concurrency: 4,
    deadlineMs: 300_000,
    onError: "return-to-model",
  });
  assert.equal(configured.cache, true);
  assert.throws(
    // @ts-expect-error A custom harness requires an explicit model.
    () => agent({ harness: configured }),
    /requires a model/,
  );
  assert.throws(
    // @ts-expect-error Callbacks were replaced by declarative configuration.
    () => harness({ modelProvider: provider, run: async () => ({}) }),
    /no longer accepts run/,
  );
  for (const [options, message] of [
    [{ observe: () => undefined }, /Unsupported harness option: observe/],
    [{ limits: { maxSteps: 0 } }, /maxSteps/],
    [{ limits: { maxToolCalls: 1.5 } }, /maxToolCalls/],
    [{ limits: { usage: { total: 1 } } }, /usage limits accept/],
    [{ limits: { usage: { output: -1 } } }, /nonnegative/],
    [{ toolExecution: { concurrency: 0 } }, /concurrency/],
    [{ toolExecution: { deadlineMs: -1 } }, /deadlineMs/],
    [{ toolExecution: { onError: "ignore" } }, /onError/],
    [{ cache: "yes" }, /cache must be boolean/],
    [{ tools: [{ name: "raw" }] }, /defineHarnessTool/],
    [{ tools: [echo, echo] }, /Duplicate tool name: echo/],
    [{ instructions: [{}] }, /defineHarnessInstructions/],
  ] as const)
    assert.throws(
      () => harness({ modelProvider: provider, ...(options as object) }),
      message,
    );
  const validated: string[] = [];
  const validating = harness({
    modelProvider: {
      ...provider,
      validate(model) {
        validated.push(model.name);
        if (model.reasoning === "max") throw new Error("unsupported max");
      },
    },
  });
  assert.equal(
    agent({ harness: validating, model: { name: "m", reasoning: "low" } }).model
      .reasoning,
    "low",
  );
  assert.throws(
    () =>
      agent({ harness: validating, model: { name: "m", reasoning: "max" } }),
    /unsupported max/,
  );
  assert.deepEqual(validated, ["m", "m"]);
  assert.throws(
    () =>
      harness({
        // @ts-expect-error Provider validation must be callable.
        modelProvider: { ...provider, validate: true },
      }),
    /validate must be a function/,
  );
  // @ts-expect-error A provider is not an executable harness.
  assert.throws(() => agent({ harness: provider, model: "m" }), /harness/);
  assert.throws(
    () =>
      agent({
        model: "m",
        harness: { kind: "custom", modelProvider: provider } as never,
      }),
    /Create custom harnesses with harness/,
  );
});

test("the built-in loop runs tools in the sandbox and returns the final answer", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const cwd = defineHarnessTool({
    name: "cwd",
    description: "Print the sandbox working directory.",
    readOnly: true,
    input: { type: "object" },
    async execute(_input, context) {
      context.observe({ kind: "text", text: "checking" });
      assert.equal(context.model.name, "tuned");
      const result = await context.sandbox.invoke({
        executable: process.execPath,
        arguments: ["-e", "process.stdout.write(process.cwd())"],
      });
      return { content: result.stdout };
    },
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: { name: "tuned", reasoning: "high", maxOutputTokens: 256 },
      harness: harness({
        modelProvider: scriptedProvider(
          [call(["cwd", {}], ["echo", { text: "hi" }]), answer()],
          requests,
        ),
        tools: [cwd, echo],
        instructions: [
          "You are careful.",
          defineHarnessInstructions(async ({ sandbox, model }) => {
            const read = await sandbox.invoke({
              executable: process.execPath,
              arguments: [
                "-e",
                "process.stdout.write(require('node:fs').readFileSync('base.txt','utf8').trim())",
              ],
            });
            return `Project marker ${read.stdout} for ${model.name}.`;
          }),
          defineHarnessInstructions(() => " "),
        ],
      }),
    }),
    brief: { text: "inspect" },
    logging: false,
    observe: (event) => {
      events.push(event);
      if (event.kind === "text") throw new Error("observer");
    },
  });
  assert.equal(result.completed, true);
  assert.equal(result.text, done);
  assert.deepEqual(result.usage, { input: 8, cached: 2, output: 4 });
  assert.equal(requests.length, 2);
  assert.equal(
    requests[0]?.system,
    "You are careful.\n\nProject marker base for tuned.",
  );
  assert.deepEqual(
    requests[0]?.tools?.map((tool) => tool.name),
    ["cwd", "echo"],
  );
  assert.equal(requests[0]?.cache, true);
  assert.equal(requests[0]?.reasoning, "high");
  assert.equal(requests[0]?.maxOutputTokens, 256);
  assert.equal(requests[0]?.messages?.length, 1);
  assert.deepEqual(requests[1]?.messages?.at(-1)?.content, [
    { type: "tool-result", callId: "call-1-0", content: root },
    { type: "tool-result", callId: "call-1-1", content: "hi" },
  ]);
  assert.deepEqual(
    events
      .map((event) => event.kind)
      .filter((kind) => ["step", "tool", "tool-result"].includes(kind)),
    ["step", "tool", "tool", "tool-result", "tool-result", "step"],
  );
  assert.ok(events.some((event) => event.kind === "text"));
  assert.equal(events.filter((event) => event.kind === "usage").length, 2);
  const toolEvent = events.find((event) => event.kind === "tool");
  assert.equal(
    toolEvent?.kind === "tool" ? toolEvent.callId : undefined,
    "call-1-0",
  );
  assert.equal(result.conversation, undefined);
});

test("tool failures return to the model unless configured to fail the turn", async (t) => {
  const root = await repository(t);
  const broken = defineHarnessTool({
    name: "broken",
    description: "Always fails.",
    input: { type: "object" },
    execute: () => {
      throw new Error("disk unavailable");
    },
  });
  const invalid = defineHarnessTool({
    name: "invalid",
    description: "Returns an unsupported value.",
    input: { type: "object" },
    execute: () => 42 as never,
  });
  const reported = defineHarnessTool({
    name: "reported",
    description: "Reports its own failure.",
    input: { type: "object" },
    execute: () => ({ content: "no match", isError: true }),
  });
  const requests: ModelRequest[] = [];
  await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: developer(
      scriptedProvider(
        [
          call(
            ["missing", {}],
            ["echo", { text: 3 }],
            ["echo", "{broken"],
            ["broken", {}],
            ["invalid", {}],
            ["reported", {}],
          ),
          answer(),
        ],
        requests,
      ),
      [echo, broken, invalid, reported],
    ),
    brief: { text: "try" },
    logging: false,
  });
  assert.deepEqual(
    (requests[1]?.messages?.at(-1)?.content ?? []).map((block) =>
      block.type === "tool-result" ? [block.isError, block.content] : [],
    ),
    [
      [true, "Unknown tool: missing"],
      [true, "Invalid input for echo: input.text must be string"],
      [true, "Invalid input for echo: input must be object"],
      [true, "disk unavailable"],
      [true, "Tools must return text or { content, isError }"],
      [true, "no match"],
    ],
  );
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: developer(scriptedProvider([call(["broken", {}])]), [broken], {
        toolExecution: { onError: "fail" },
      }),
      brief: { text: "try" },
      logging: false,
    }),
    /disk unavailable/,
  );
});

test("read-only calls run concurrently while mutating calls are serialized in call order", async (t) => {
  const root = await repository(t);
  let active = 0;
  let peak = 0;
  const log: string[] = [];
  const timed = (name: string, readOnly: boolean) =>
    defineHarnessTool({
      name,
      description: `Timed ${name}.`,
      readOnly,
      input: {
        type: "object",
        properties: { delay: { type: "integer", minimum: 0 } },
      },
      async execute(input: { delay?: number }) {
        active++;
        peak = Math.max(peak, active);
        log.push(`start ${name}`);
        await new Promise((resolve) => setTimeout(resolve, input.delay ?? 0));
        active--;
        log.push(`end ${name}`);
        return name;
      },
    });
  const requests: ModelRequest[] = [];
  await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: developer(
      scriptedProvider(
        [
          call(
            ["slow", { delay: 60 }],
            ["fast", { delay: 5 }],
            ["write", { delay: 5 }],
            ["fast", { delay: 1 }],
          ),
          answer(),
        ],
        requests,
      ),
      [timed("slow", true), timed("fast", true), timed("write", false)],
      { toolExecution: { concurrency: 2 } },
    ),
    brief: { text: "parallel" },
    logging: false,
  });
  assert.equal(peak, 2);
  assert.deepEqual(resultContents(requests[1]), [
    "slow",
    "fast",
    "write",
    "fast",
  ]);
  assert.ok(log.indexOf("start write") > log.indexOf("end slow"));
  assert.ok(log.lastIndexOf("start fast") > log.indexOf("end write"));
});

test("harness limits fail with identified errors instead of success", async (t) => {
  const root = await repository(t);
  const run = (provider: ModelProvider, extra = {}) =>
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: developer(provider, [echo], extra),
      brief: { text: "loop" },
      logging: false,
    });
  const loop = () => call(["echo", { text: "again" }]);
  await assert.rejects(
    run(scriptedProvider([loop(), loop()]), { limits: { maxSteps: 2 } }),
    { code: "limit", details: { limit: "maxSteps" } },
  );
  await assert.rejects(
    run(scriptedProvider([loop(), loop()]), { limits: { maxToolCalls: 1 } }),
    { code: "limit", details: { limit: "maxToolCalls" } },
  );
  await assert.rejects(
    run(scriptedProvider([loop(), loop()]), {
      limits: { usage: { output: 1 } },
    }),
    { code: "limit", details: { limit: "usage" } },
  );
  await assert.rejects(
    run(scriptedProvider([() => ({ text: done })]), {
      limits: { usage: { output: 10 } },
    }),
    /require a model provider that reports usage/,
  );
  await assert.rejects(
    run(
      scriptedProvider([
        () => ({
          text: "",
          content: [{ type: "tool-call", id: "cut", name: "echo", input: "{" }],
          stopReason: "max-tokens",
        }),
      ]),
    ),
    { code: "limit", details: { limit: "maxOutputTokens", step: 1 } },
  );
  await assert.rejects(
    run(scriptedProvider([() => ({ text: "no", stopReason: "refusal" })])),
    { code: "response" },
  );
  const inferred: ModelRequest[] = [];
  const completed = await run(
    scriptedProvider(
      [
        () => ({
          text: "",
          content: [
            { type: "tool-call", id: "x", name: "echo", input: { text: "a" } },
          ],
        }),
        () => ({ text: done }),
      ],
      inferred,
    ),
  );
  assert.equal(completed.completed, true);
  assert.deepEqual(resultContents(inferred[1]), ["a"]);
});

test("tool deadlines release tools that ignore cancellation and hold the idle watchdog", async (t) => {
  const root = await repository(t);
  const stuck = defineHarnessTool({
    name: "stuck",
    description: "Never settles.",
    input: { type: "object" },
    execute: () => new Promise<string>(() => undefined),
  });
  const quiet = defineHarnessTool({
    name: "quiet",
    description: "Silent work longer than the idle deadline.",
    input: { type: "object" },
    execute: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return "finished";
    },
  });
  const requests: ModelRequest[] = [];
  const started = Date.now();
  const bounded = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: developer(
      scriptedProvider(
        [call(["stuck", {}], ["quiet", {}]), answer()],
        requests,
      ),
      [stuck, quiet],
      { toolExecution: { deadlineMs: 50 } },
    ),
    brief: { text: "wait" },
    idleMs: 100,
    logging: false,
  });
  assert.equal(bounded.completed, true);
  assert.ok(Date.now() - started < 5_000);
  assert.deepEqual(resultContents(requests[1]), [
    "Tool stuck timed out after 50 ms",
    "Tool quiet timed out after 50 ms",
  ]);
  const patient = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: developer(
      scriptedProvider([call(["quiet", {}]), answer()], requests),
      [quiet],
    ),
    brief: { text: "wait" },
    idleMs: 100,
    logging: false,
  });
  assert.equal(patient.completed, true);
  assert.deepEqual(resultContents(requests.at(-1)), ["finished"]);
});

test("custom harness rejects absent capabilities before sandbox allocation", async () => {
  const configured = developer(scriptedProvider([]));
  const sandboxProvider = {
    ...localSandboxProvider(),
    async acquire() {
      throw new Error("must not allocate");
    },
  };
  await assert.rejects(
    dispatch({
      agent: configured,
      sandboxProvider,
      brief: { text: "hi" },
      continuation: { id: "missing" },
    }),
    /does not support/,
  );
  await assert.rejects(
    attach({ agent: configured, sandboxProvider }),
    /interactive/,
  );
  await assert.rejects(
    dispatch({
      agent: configured,
      sandboxProvider,
      brief: { text: "<x>" },
      response: response.text({ tag: "x", repairs: 1 }),
    }),
    /repair/,
  );
});

test("custom harness cancellation reaches tool commands and keeps a warm sandbox reusable", async (t) => {
  const root = await repository(t);
  const controller = new AbortController();
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const sleep = defineHarnessTool({
    name: "sleep",
    description: "Run a long command.",
    input: { type: "object" },
    async execute(_input, context) {
      started();
      await context.sandbox.invoke({
        executable: process.execPath,
        arguments: ["-e", "setTimeout(()=>{},10000)"],
      });
      return "late";
    },
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  const pending = sandbox.dispatch({
    agent: developer(scriptedProvider([call(["sleep", {}])]), [sleep]),
    brief: { text: "wait" },
    signal: controller.signal,
  });
  const rejected = assert.rejects(pending);
  await ready;
  controller.abort();
  await rejected;
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
  assert.equal(
    (
      await sandbox.dispatch({
        agent: developer(scriptedProvider([answer()])),
        brief: { text: "reuse" },
      })
    ).completed,
    true,
  );
});

test("custom harness deadlines abort provider calls and return no late result", async (t) => {
  const root = await repository(t);
  const hanging: ModelProvider = {
    name: "hanging",
    async request({ signal }) {
      assert.ok(signal);
      await new Promise<void>((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new Error("Model request was cancelled")),
          { once: true },
        );
      });
      return { text: "late" };
    },
  };
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: developer(hanging),
      brief: { text: "wait" },
      deadlineMs: 30,
      logging: false,
    }),
    { code: "timeout" },
  );
});

test("borrowed tool sandboxes preserve binary data and cannot release their owner", async (t) => {
  const { writeFile, readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const root = await repository(t);
  const bytes = Buffer.from([0, 255, 1, 10, 128]);
  const source = join(root, "input.bin");
  await writeFile(source, bytes);
  const transfer = defineHarnessTool({
    name: "transfer",
    description: "Round-trip a binary file.",
    input: { type: "object" },
    async execute(_input, context) {
      await context.sandbox.upload(
        source,
        join(context.sandbox.root, "payload.bin"),
      );
      const check = await context.sandbox.invoke({
        executable: process.execPath,
        arguments: [
          "-e",
          "process.stdout.write(require('node:fs').readFileSync('payload.bin').toString('hex'))",
        ],
        observe() {
          throw new Error("observer failure");
        },
      });
      assert.equal(check.status, 0, check.stderr);
      assert.equal(check.stdout, bytes.toString("hex"));
      const target = join(root, "output.bin");
      await context.sandbox.download(
        join(context.sandbox.root, "payload.bin"),
        target,
      );
      assert.deepEqual(await readFile(target), bytes);
      await assert.rejects(context.sandbox.release(), /does not own/);
      assert.throws(
        () => context.observe({ kind: "conversation", id: "fake" } as never),
        /only report text, warning or raw/,
      );
      return "transferred";
    },
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  const requests: ModelRequest[] = [];
  const result = await sandbox.dispatch({
    agent: developer(
      scriptedProvider([call(["transfer", {}]), answer()], requests),
      [transfer],
    ),
    brief: { text: "transfer" },
  });
  assert.equal(result.completed, true);
  assert.deepEqual(resultContents(requests[1]), ["transferred"]);
});

test("legacy sandbox selector is rejected instead of silently choosing Docker", async () => {
  await assert.rejects(
    // @ts-expect-error The old selector is intentionally unsupported.
    createSandbox({ provider: localSandboxProvider() }),
    /Use sandboxProvider/,
  );
});

test("switching CLI configurations reactivates authentication without repeating unchanged access", async (t) => {
  const { scripted, emit } = await import("../helpers.ts");
  const root = await repository(t);
  const selected: string[] = [];
  const first = {
    ...scripted(emit(done)),
    authenticate() {
      selected.push("first");
      return undefined;
    },
  };
  const second = {
    ...scripted(emit(done)),
    authenticate() {
      selected.push("second");
      return undefined;
    },
  };
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  for (const chosen of [first, first, second, first])
    await sandbox.dispatch({ agent: chosen, brief: { text: "run" } });
  assert.deepEqual(selected, ["first", "second", "first"]);
});
