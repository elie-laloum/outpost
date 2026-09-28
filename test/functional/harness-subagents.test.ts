import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  agent,
  harness,
  defineHarnessSubagent,
  defineHarnessTool,
  defineHarnessPermissions,
  defineHarnessContextStrategy,
  defineHarnessHook,
  dispatch,
  createSandbox,
  harnessConversations,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
  type HarnessOptions,
  type AgentObservation,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const tokens = { input: 4, cached: 1, output: 2 };
const done = (text = "<outpost>done</outpost>"): ModelResult => ({
  text,
  usage: tokens,
});
const call = (
  name: string,
  input: unknown = { prompt: "Inspect the fixture" },
): ModelResult => ({
  text: "",
  usage: tokens,
  stopReason: "tool-calls",
  content: [{ type: "tool-call", id: "call-1", name, input }],
});
function provider(
  replies: ((request: ModelRequest) => ModelResult | Promise<ModelResult>)[],
): ModelProvider {
  return {
    name: "fixture",
    async request(request) {
      request.signal?.throwIfAborted();
      const reply = replies.shift();
      assert.ok(reply, "Unexpected request");
      return reply(request);
    },
  };
}
const coder = (
  modelProvider: ModelProvider,
  extra: Omit<HarnessOptions, "modelProvider"> = {},
) =>
  agent({
    model: { name: "fixture", maxOutputTokens: 100 },
    harness: harness({ modelProvider, ...extra }),
  });
const delegate = (
  modelProvider: ModelProvider,
  extra: Omit<HarnessOptions, "modelProvider"> = {},
) =>
  defineHarnessSubagent({
    name: "inspect",
    description: "Inspect the fixture",
    agent: coder(modelProvider, extra),
  });

function toolResults(request: ModelRequest) {
  return (
    request.messages
      ?.at(-1)
      ?.content.filter((block) => block.type === "tool-result") ?? []
  );
}

test("subagents borrow one sandbox, isolate history, persist lineage and account usage once", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  let childConversation = "";
  const child = delegate(
    provider([
      (request) => {
        assert.equal(request.messages?.length, 1);
        assert.equal(request.model, "fixture");
        assert.equal(request.maxOutputTokens, 100);
        assert.equal(request.messages[0]?.content[0]?.type, "text");
        assert.ok(!JSON.stringify(request).includes("parent-private-marker"));
        return call("read", {});
      },
      (request) => {
        assert.equal(toolResults(request)[0]?.content, "base\n");
        return done("child answer");
      },
    ]),
    {
      tools: [
        defineHarnessTool({
          name: "read",
          description: "Read fixture",
          readOnly: true,
          input: { type: "object" },
          async execute(_input, context) {
            await assert.rejects(context.sandbox.release(), /does not own/);
            const result = await context.sandbox.invoke({
              executable: process.execPath,
              arguments: [
                "-e",
                "process.stdout.write(require('fs').readFileSync('base.txt'))",
              ],
            });
            assert.equal(result.status, 0);
            return result.stdout;
          },
        }),
      ],
    },
  );
  const parent = coder(
    provider([
      () => call("inspect"),
      (request) => {
        const output = JSON.parse(toolResults(request)[0]!.content);
        assert.equal(output.text, "child answer");
        childConversation = output.conversation;
        assert.equal(request.messages?.length, 3);
        return done();
      },
    ]),
    { tools: [child] },
  );
  const result = await dispatch({
    repository: root,
    agent: parent,
    sandboxProvider: localSandboxProvider(),
    brief: { text: "parent-private-marker" },
    logging: false,
    observe: (event) => events.push(event),
  });
  assert.equal(result.completed, true);
  assert.deepEqual(result.usage, { input: 16, cached: 4, output: 8 });
  assert.equal(events.filter((event) => event.kind === "usage").length, 4);
  const started = events.find(
    (event) => event.kind === "subagent" && event.status === "started",
  );
  assert.ok(started?.kind === "subagent");
  assert.equal(started.conversation, childConversation);
  assert.ok(
    events.some(
      (event) => event.kind === "step" && event.subagentId === started.id,
    ),
  );
  assert.equal(
    events.filter((event) => event.kind === "tool-output").length,
    1,
  );
  const childFile = await harnessConversations().locate(
    childConversation,
    root,
  );
  const session = JSON.parse(
    (await readFile(childFile.file, "utf8")).split("\n")[0]!,
  );
  assert.equal(session.parentCallId, "call-1");
  assert.equal(session.parentConversation, result.conversation);
});

test("parent permissions restrict tools allowed by the child", async (t) => {
  const root = await repository(t);
  let executed = false;
  const forbidden = defineHarnessTool({
    name: "write",
    description: "Write",
    input: { type: "object" },
    execute() {
      executed = true;
      return "bad";
    },
  });
  const child = delegate(
    provider([
      () => call("write", {}),
      (request) => {
        assert.match(toolResults(request)[0]!.content, /Denied/);
        return done();
      },
    ]),
    {
      tools: [forbidden],
      permissions: defineHarnessPermissions({ rules: [], default: "allow" }),
    },
  );
  const parent = coder(provider([() => call("inspect"), () => done()]), {
    tools: [child],
    permissions: defineHarnessPermissions({
      rules: [{ effect: "deny", tools: ["write"] }],
      default: "allow",
    }),
  });
  await dispatch({
    repository: root,
    agent: parent,
    sandboxProvider: localSandboxProvider(),
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(executed, false);
});

test("descendant usage exhausts the parent budget even with recoverable tool errors", async (t) => {
  const root = await repository(t);
  let parentContinued = false;
  const parent = coder(
    provider([
      () => call("inspect"),
      () => {
        parentContinued = true;
        return done();
      },
    ]),
    {
      tools: [delegate(provider([() => done()]))],
      limits: { usage: { output: 3 } },
    },
  );
  await assert.rejects(
    dispatch({
      repository: root,
      agent: parent,
      sandboxProvider: localSandboxProvider(),
      brief: { text: "test" },
      logging: false,
    }),
    { code: "limit", details: { limit: "usage" } },
  );
  assert.equal(parentContinued, false);
});

test("child limits return a tool error while the parent retains its remaining budget", async (t) => {
  const root = await repository(t);
  const parent = coder(
    provider([
      () => call("inspect"),
      (request) => {
        assert.equal(toolResults(request)[0]?.isError, true);
        assert.match(toolResults(request)[0]!.content, /token budget/);
        return done();
      },
    ]),
    {
      tools: [
        delegate(provider([() => done()]), {
          limits: { usage: { output: 1 } },
        }),
      ],
      limits: { usage: { output: 10 } },
    },
  );
  const result = await dispatch({
    repository: root,
    agent: parent,
    sandboxProvider: localSandboxProvider(),
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(result.usage.output, 6);
});

test("final responses and context summaries cannot escape token budgets", async (t) => {
  const root = await repository(t);
  for (const context of [
    undefined,
    defineHarnessContextStrategy({
      name: "summarize",
      async compact(input) {
        await input.summarize(input.messages);
      },
    }),
  ]) {
    let requests = 0;
    const parent = coder(
      {
        name: "budget",
        async request() {
          requests++;
          return done();
        },
      },
      {
        limits: { usage: { output: 1 } },
        ...(context ? { context } : {}),
      },
    );
    await assert.rejects(
      dispatch({
        repository: root,
        agent: parent,
        sandboxProvider: localSandboxProvider(),
        brief: { text: "test" },
        logging: false,
      }),
      { code: "limit", details: { limit: "usage" } },
    );
    assert.equal(requests, 1);
  }
});

test("delegation depth cannot be raised by descendants", async (t) => {
  const root = await repository(t);
  let leafCalled = false;
  const nested = delegate(
    provider([
      () => {
        leafCalled = true;
        return done();
      },
    ]),
  );
  const child = delegate(
    provider([
      () => call("inspect"),
      (request) => {
        assert.equal(toolResults(request)[0]?.isError, true);
        assert.match(toolResults(request)[0]!.content, /depth/);
        return done();
      },
    ]),
    { tools: [nested], limits: { maxDelegationDepth: 10 } },
  );
  const parent = coder(provider([() => call("inspect"), () => done()]), {
    tools: [child],
    limits: { maxDelegationDepth: 1 },
  });
  await dispatch({
    repository: root,
    agent: parent,
    sandboxProvider: localSandboxProvider(),
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(leafCalled, false);
  assert.equal(child.readOnly, false);
});

test("child request cancellation reaches its provider and leaves a warm sandbox reusable", async (t) => {
  const root = await repository(t);
  const controller = new AbortController();
  let receivedSignal: AbortSignal | undefined;
  const child = delegate(
    provider([
      async (request) => {
        receivedSignal = request.signal;
        controller.abort(new Error("cancel child"));
        request.signal!.throwIfAborted();
        return done();
      },
    ]),
  );
  const sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: coder(provider([() => call("inspect")]), { tools: [child] }),
    logging: false,
  });
  t.after(() => sandbox.close());
  await assert.rejects(
    sandbox.dispatch({ brief: { text: "test" }, signal: controller.signal }),
    /cancel child/,
  );
  assert.equal(receivedSignal?.aborted, true);
  const result = await sandbox.dispatch({
    agent: coder(provider([() => done()])),
    brief: { text: "reuse" },
  });
  assert.equal(result.completed, true);
});

test("child tool deadlines abort model calls and cannot produce a late parent result", async (t) => {
  const root = await repository(t);
  let cancelled = false;
  const child = delegate(
    provider([
      (request) =>
        new Promise((_resolve, reject) => {
          request.signal!.addEventListener(
            "abort",
            () => {
              cancelled = true;
              reject(request.signal!.reason);
            },
            { once: true },
          );
        }),
    ]),
  );
  const parent = coder(
    provider([
      () => call("inspect"),
      (request) => {
        assert.equal(toolResults(request)[0]?.isError, true);
        return done();
      },
    ]),
    { tools: [child], toolExecution: { deadlineMs: 100 } },
  );
  await dispatch({
    repository: root,
    agent: parent,
    sandboxProvider: localSandboxProvider(),
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(cancelled, true);
});

test("subagent configuration rejects CLI agents, invalid prompts and duplicate names", async () => {
  const child = delegate(provider([]));
  assert.deepEqual(await child.validate({ prompt: "valid" }), {
    value: { prompt: "valid" },
  });
  assert.ok("issues" in (await child.validate({ prompt: "" })));
  assert.throws(
    () => harness({ modelProvider: provider([]), tools: [child, child] }),
    /Duplicate tool/,
  );
  assert.throws(
    () =>
      harness({
        modelProvider: provider([]),
        limits: { maxDelegationDepth: -1 },
      }),
    /maxDelegationDepth/,
  );
  assert.throws(
    () =>
      defineHarnessSubagent({
        name: "bad",
        description: "Bad",
        agent: null as never,
      }),
    /built-in harness/,
  );
  assert.throws(
    () => child.execute({ prompt: "x" }, {} as never),
    /harness runtime/,
  );
});

test("sibling delegations serialize edits and child streams retain correlation", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  let active = 0,
    peak = 0,
    completed = 0;
  const child = delegate(
    {
      name: "stream",
      request: async () => done(),
      async *stream() {
        active++;
        peak = Math.max(peak, active);
        try {
          await new Promise((resolve) => setTimeout(resolve, 15));
          yield { type: "text-delta", text: "child" };
          yield { type: "result", result: done("child") };
          completed++;
        } finally {
          active--;
        }
      },
    },
    { conversations: false },
  );
  const parent = coder(
    provider([
      () => ({
        ...call("inspect"),
        content: [
          {
            type: "tool-call",
            id: "one",
            name: "inspect",
            input: { prompt: "first" },
          },
          {
            type: "tool-call",
            id: "two",
            name: "inspect",
            input: { prompt: "second" },
          },
        ],
      }),
      (request) => {
        assert.deepEqual(
          toolResults(request).map((result) => result.callId),
          ["one", "two"],
        );
        assert.ok(
          toolResults(request).every(
            (result) => !JSON.parse(result.content).conversation,
          ),
        );
        return done();
      },
    ]),
    { tools: [child] },
  );
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: parent,
    brief: { text: "test" },
    logging: false,
    observe: (event) => events.push(event),
  });
  assert.equal(peak, 1);
  assert.equal(completed, 2);
  assert.equal(result.usage.output, 8);
  const deltas = events.filter((event) => event.kind === "text-delta");
  assert.equal(deltas.length, 2);
  assert.ok(
    deltas.every(
      (event) =>
        event.subagentId && event.scope?.subagentId === event.subagentId,
    ),
  );
  assert.notEqual(deltas[0]?.subagentId, deltas[1]?.subagentId);
});

test("child stores capture transcripts and parent continuation does not replay delegation", async (t) => {
  const root = await repository(t);
  const captured: string[] = [];
  const store = harnessConversations();
  const child = delegate(provider([() => done("child")]), {
    conversations: {
      ...store,
      async capture(id, context) {
        captured.push(id);
        return store.capture(id, context);
      },
    },
  });
  const parent = coder(
    provider([
      () => call("inspect"),
      () => done(),
      (request) => {
        assert.ok(JSON.stringify(request.messages).includes("child"));
        return done();
      },
    ]),
    { tools: [child] },
  );
  const sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: parent,
    logging: false,
  });
  t.after(() => sandbox.close());
  const first = await sandbox.dispatch({
    brief: { text: "test" },
    logging: false,
  });
  assert.ok(first.conversation);
  const second = await sandbox.dispatch({
    brief: { text: "continue" },
    continuation: { id: first.conversation },
    logging: false,
  });
  assert.equal(second.completed, true);
  assert.equal(captured.length, 1);
});

test("unknown descendant usage cannot bypass an ancestor token budget", async (t) => {
  const root = await repository(t);
  for (const result of [
    { text: "unknown" },
    { text: "partial", usage: { ...tokens, complete: false } },
  ]) {
    const parent = coder(provider([() => call("inspect")]), {
      tools: [delegate(provider([() => result]))],
      limits: { usage: { output: 20 } },
    });
    await assert.rejects(
      dispatch({
        repository: root,
        agent: parent,
        sandboxProvider: localSandboxProvider(),
        brief: { text: "test" },
        logging: false,
      }),
      /reports usage completely/,
    );
  }
});

test("child capture failures report failure and release transcript ownership", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  const native = harnessConversations();
  let id = "";
  const child = delegate(provider([() => done()]), {
    conversations: {
      ...native,
      async capture(value) {
        id = value;
        throw new Error("archive unavailable");
      },
    },
  });
  const parent = coder(
    provider([
      () => call("inspect"),
      (request) => {
        assert.equal(toolResults(request)[0]?.isError, true);
        assert.match(toolResults(request)[0]!.content, /archive unavailable/);
        return done();
      },
    ]),
    { tools: [child] },
  );
  await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: parent,
    brief: { text: "test" },
    logging: false,
    observe: (event) => events.push(event),
  });
  assert.ok(
    events.some(
      (event) => event.kind === "subagent" && event.status === "failed",
    ),
  );
  assert.ok(
    !events.some(
      (event) => event.kind === "subagent" && event.status === "finished",
    ),
  );
  const resumed = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: coder(provider([() => done()])),
    continuation: { id },
    brief: { text: "recover" },
    logging: false,
  });
  assert.equal(resumed.completed, true);
});

test("child input rewrites are rechecked against ancestor resource permissions", async (t) => {
  const root = await repository(t);
  let executed = false;
  const write = defineHarnessTool({
    name: "write",
    description: "Write fixture",
    input: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
    },
    resources: (input: { path: string }) => ({ paths: [input.path] }),
    execute() {
      executed = true;
      return "written";
    },
  });
  const child = delegate(
    provider([
      () => call("write", { path: "public.txt" }),
      (request) => {
        assert.equal(toolResults(request)[0]?.isError, true);
        return done();
      },
    ]),
    {
      tools: [write],
      hooks: [
        defineHarnessHook({
          name: "rewrite",
          on: "before-tool",
          run: () => ({ input: { path: "private.txt" } }),
        }),
      ],
    },
  );
  const parent = coder(provider([() => call("inspect"), () => done()]), {
    tools: [child],
    permissions: defineHarnessPermissions({
      default: "allow",
      rules: [{ effect: "deny", paths: ["private.txt"] }],
    }),
  });
  await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: parent,
    brief: { text: "test" },
    logging: false,
  });
  assert.equal(executed, false);
});

test("unknown model usage reaches synchronous accounting and observers", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: coder(provider([() => ({ text: "<outpost>done</outpost>" })])),
    brief: { text: "test" },
    logging: false,
    observe: (event) => events.push(event),
  });
  assert.equal(result.usage.complete, false);
  assert.ok(
    events.some(
      (event) => event.kind === "usage" && event.tokens.complete === false,
    ),
  );
});
