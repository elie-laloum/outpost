import assert from "node:assert/strict";
import { test } from "node:test";
import { createAgent, defineTextResponse, dispatch } from "../../src/core.ts";
import {
  defineHarnessHook,
  defineHarnessContextStrategy,
  defineHarnessPermissions,
  defineHarnessTool,
  createHarness,
  type HarnessOptions,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
} from "../../src/harness.ts";
import { type AgentObservation } from "../../src/integrations.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const done = "<outpost>done</outpost>";
type Reply = (request: ModelRequest) => ModelResult;

const provider = (
  replies: Reply[],
  requests: ModelRequest[],
): ModelProvider => ({
  name: "scripted",
  async request(request) {
    requests.push(request);
    const reply = replies.shift();
    assert.ok(reply, "unexpected model request");
    return reply(request);
  },
});
const answer =
  (text = done): Reply =>
  () => ({ text, content: [{ type: "text", text }], stopReason: "end" });
const call =
  (...calls: [name: string, input: unknown][]): Reply =>
  (request) => ({
    text: "",
    content: calls.map(([name, input], index) => ({
      type: "tool-call" as const,
      id: `c${request.messages?.length ?? 0}-${index}`,
      name,
      input,
    })),
    stopReason: "tool-calls",
  });
const results = (request: ModelRequest | undefined) =>
  (request?.messages?.at(-1)?.content ?? []).map((block) =>
    block.type === "tool-result" ? block.content : block.type,
  );

const executed: string[] = [];
const write = defineHarnessTool({
  name: "write_file",
  description: "Pretend to write a file.",
  input: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
  resources: (input: { path: string }) => ({ paths: [input.path] }),
  execute: (input: { path: string }) => {
    executed.push(input.path);
    return `wrote ${input.path}`;
  },
});

async function run(
  t: import("node:test").TestContext,
  replies: Reply[],
  options: Omit<HarnessOptions, "modelProvider" | "tools">,
  extra: Partial<Parameters<typeof dispatch>[0]> = {},
) {
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const root = await repository(t);
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: createAgent({
      model: "m",
      harness: createHarness({
        modelProvider: provider(replies, requests),
        tools: [write],
        ...options,
      }),
    }),
    brief: { text: "edit" },
    logging: false,
    observe: (event) => events.push(event),
    ...extra,
  });
  return { result, requests, events };
}

test("hooks add instructions, observe model steps and control tool calls", async (t) => {
  executed.length = 0;
  const seen: string[] = [];
  const { requests, events } = await run(
    t,
    [
      call(
        ["write_file", { path: "src/a.ts" }],
        ["write_file", { path: "secret.txt" }],
        ["write_file", { path: "src/redirect.ts" }],
        ["write_file", { path: "src/bad.ts" }],
        ["write_file", { path: "src/outside.ts" }],
        ["write_file", { path: "../escape.ts" }],
      ),
      answer(),
    ],
    {
      instructions: "Base rules.",
      permissions: defineHarnessPermissions({
        default: "deny",
        rules: [{ effect: "allow", tools: ["write_file"], paths: ["src/**"] }],
      }),
      hooks: [
        defineHarnessHook({
          on: "session-start",
          run: ({ prompt, step }) => ({
            instructions: `Session for ${prompt.trim().split("\n")[0]} at ${step}.`,
          }),
        }),
        defineHarnessHook({
          on: "before-model",
          run: ({ messages, step }) => {
            seen.push(`before ${step}:${messages.length}`);
          },
        }),
        defineHarnessHook({
          on: "after-model",
          run: ({ result, step }) => {
            seen.push(`after ${step}:${result.stopReason}`);
          },
        }),
        defineHarnessHook({
          on: "before-tool",
          name: "guard",
          run: ({ call: current }) => {
            const path = (current.input as { path: string }).path;
            seen.push(`guard ${path}`);
            if (path === "src/a.ts") return undefined;
            if (path === "src/redirect.ts")
              return { input: { path: "src/redirected.ts" } };
            if (path === "src/bad.ts") return { input: { path: 1 } };
            if (path === "src/outside.ts")
              return { input: { path: "../outside.ts" } };
            return { deny: "not reviewed" };
          },
        }),
        defineHarnessHook({
          on: "after-tool",
          run: ({ call: current, result }) =>
            current.id.endsWith("-0")
              ? { result: { content: `${result.content} (audited)` } }
              : undefined,
        }),
      ],
    },
  );
  assert.equal(requests[0]?.system, "Base rules.\n\nSession for edit at 0.");
  assert.deepEqual(results(requests[1]), [
    "wrote src/a.ts (audited)",
    "Denied: Denied by default permissions",
    "wrote src/redirected.ts",
    "Hook produced invalid input for write_file: input.path must be string",
    "Denied: Denied by default permissions",
    "Denied: Denied by default permissions",
  ]);
  assert.deepEqual(executed, ["src/a.ts", "src/redirected.ts"]);
  assert.deepEqual(seen, [
    "before 1:1",
    "after 1:tool-calls",
    "guard src/a.ts",
    "guard src/redirect.ts",
    "guard src/bad.ts",
    "guard src/outside.ts",
    "before 2:3",
    "after 2:end",
  ]);
  assert.equal(
    events.filter((event) => event.kind === "tool-denied").length,
    3,
  );
});

test("stop hooks keep the loop running within its step limit", async (t) => {
  let checks = 0;
  const reviewing = defineHarnessHook({
    on: "stop",
    run: ({ text }) => {
      checks++;
      return text.includes("tested") ? undefined : { continue: "Run tests." };
    },
  });
  const { result, requests, events } = await run(
    t,
    [answer("draft"), answer(`tested ${done}`)],
    { hooks: [reviewing] },
  );
  assert.equal(result.completed, true);
  assert.equal(checks, 2);
  assert.deepEqual(requests[1]?.messages?.slice(-2), [
    { role: "assistant", content: [{ type: "text", text: "draft" }] },
    { role: "user", content: [{ type: "text", text: "Run tests." }] },
  ]);
  assert.ok(events.some((event) => event.kind === "stop-prevented"));
  await assert.rejects(
    run(t, [answer("a"), answer("b")], {
      hooks: [reviewing],
      limits: { maxSteps: 2 },
    }),
    { code: "limit", details: { limit: "maxSteps" } },
  );
});

test("hook failures and invalid decisions fail the turn", async (t) => {
  for (const [hook, pattern] of [
    [
      defineHarnessHook({
        on: "before-model",
        run: () => {
          throw new Error("budget exhausted");
        },
      }),
      /budget exhausted/,
    ],
    [
      defineHarnessHook({ on: "session-start", run: () => ({}) as never }),
      /session-start hooks may only return/,
    ],
    [
      defineHarnessHook({ on: "stop", run: () => ({ continue: " " }) }),
      /stop hooks may only return/,
    ],
  ] as const)
    await assert.rejects(run(t, [answer()], { hooks: [hook] }), pattern);
  for (const [decision, pattern] of [
    [{ deny: "" }, /deny reasons/],
    [{ allow: true }, /may return \{ deny \} or \{ input \}/],
    [1, /may return \{ deny \} or \{ input \}/],
  ] as const)
    await assert.rejects(
      run(t, [call(["write_file", { path: "src/a.ts" }])], {
        hooks: [
          defineHarnessHook({
            on: "before-tool",
            run: () => decision as never,
          }),
        ],
      }),
      pattern,
    );
  await assert.rejects(
    run(t, [call(["write_file", { path: "src/a.ts" }])], {
      hooks: [
        defineHarnessHook({ on: "after-tool", run: () => ({}) as never }),
      ],
    }),
    /after-tool hooks may only return/,
  );
  assert.throws(
    () =>
      createHarness({
        modelProvider: provider([], []),
        // @ts-expect-error Hooks must be defined with defineHarnessHook.
        hooks: [{ on: "stop", run: () => undefined }],
      }),
    /defineHarnessHook/,
  );
  assert.throws(
    () =>
      createHarness({
        modelProvider: provider([], []),
        // @ts-expect-error Permissions must be defined with defineHarnessPermissions.
        permissions: { rules: [] },
      }),
    /defineHarnessPermissions/,
  );
});

test("model transformations compose without changing billed usage or response instructions", async (t) => {
  const phases: string[] = [];
  const { result } = await run(
    t,
    [
      (request) => {
        const last = request.messages!.at(-1)!.content.at(-1)!;
        assert.equal(last.type, "text");
        if (last.type === "text")
          assert.match(last.text, /Final response format:/);
        assert.equal(request.system, "rewritten system");
        return {
          text: "original",
          stopReason: "end",
          usage: { input: 7, cached: 0, output: 3 },
        };
      },
    ],
    {
      hooks: [
        defineHarnessHook({
          on: "before-prompt",
          run: ({ prompt }) => ({ prompt: `rewritten ${prompt}` }),
        }),
        defineHarnessHook({
          on: "before-model",
          run({ messages }) {
            assert.ok(Object.isFrozen(messages));
            return {
              system: "rewritten system",
              messages: [
                {
                  role: "user",
                  content: [{ type: "text", text: "replace everything" }],
                },
              ],
            };
          },
        }),
        defineHarnessHook({
          on: "after-model",
          run({ result }) {
            assert.equal(result.usage!.output, 3);
            return { result: { text: "intermediate" } };
          },
        }),
        defineHarnessHook({
          on: "after-model",
          run({ result }) {
            assert.equal(result.text, "intermediate");
            return { result: { text: done } };
          },
        }),
        defineHarnessHook({
          on: "run-end",
          run({ reason, step, text }) {
            phases.push(reason);
            assert.equal(step, 1);
            assert.equal(text, done);
          },
        }),
      ],
    },
    { response: defineTextResponse({ tag: "outpost" }) },
  );
  assert.equal(result.completed, true, JSON.stringify(result));
  assert.equal(result.usage.input, 7);
  assert.equal(result.usage.output, 3);
  assert.deepEqual(phases, ["success"]);
});

test("model hooks cannot forge accounting or erase a refusal", async (t) => {
  await assert.rejects(
    run(t, [answer()], {
      hooks: [
        defineHarnessHook({
          on: "after-model",
          run: () => ({ result: { text: done, usage: { input: 0 } } }) as never,
        }),
      ],
    }),
    /unsupported fields/,
  );
  await assert.rejects(
    run(t, [() => ({ text: "no", stopReason: "refusal" })], {
      hooks: [
        defineHarnessHook({
          on: "after-model",
          run: () => ({ result: { text: done } }),
        }),
      ],
    }),
    /refused/,
  );
});

test("model errors retain their cause and run-end executes once even if reporting hooks fail", async (t) => {
  const phases: string[] = [];
  await assert.rejects(
    run(
      t,
      [
        () => {
          throw new Error("provider failed");
        },
      ],
      {
        hooks: [
          defineHarnessHook({
            on: "model-error",
            run({ error }) {
              assert.match(String(error), /provider failed/);
              phases.push("model-error");
              throw new Error("reporter failed");
            },
          }),
          defineHarnessHook({
            on: "run-end",
            run({ reason }) {
              phases.push(reason);
              throw new Error("cleanup failed");
            },
          }),
        ],
      },
    ),
    /provider failed/,
  );
  assert.deepEqual(phases, ["model-error", "error"]);
});

test("hook deadlines close borrowed capabilities and still report run-end", async (t) => {
  const phases: string[] = [];
  let borrowed:
    import("../../src/domain/sandbox.types.ts").SandboxLease | undefined;
  await assert.rejects(
    run(t, [], {
      hooks: [
        defineHarnessHook({
          on: "before-prompt",
          timeoutMs: 20,
          run({ sandbox }) {
            borrowed = sandbox;
            return new Promise(() => {});
          },
        }),
        defineHarnessHook({
          on: "run-end",
          run({ reason }) {
            phases.push(reason);
          },
        }),
      ],
    }),
    /exceeded 20 ms/,
  );
  assert.deepEqual(phases, ["timeout"]);
  assert.throws(
    () => borrowed!.invoke({ executable: "node" }),
    /exceeded 20 ms/,
  );
  await assert.rejects(borrowed!.release(), /does not own/);
});

test("harness command hooks receive JSON and transform their own phase", async (t) => {
  const { requests } = await run(t, [answer()], {
    hooks: [
      defineHarnessHook({
        on: "before-prompt",
        command: {
          executable: process.execPath,
          arguments: [
            "-e",
            "let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>process.stdout.write(JSON.stringify({prompt:'command:'+JSON.parse(input).prompt})))",
          ],
        },
      }),
    ],
  });
  const first = requests[0]!.messages![0]!.content[0]!;
  assert.equal(first.type, "text");
  if (first.type === "text") assert.match(first.text, /^command:/);
});

test("after-model generated tool calls still pass permission checks", async (t) => {
  executed.length = 0;
  let changed = false;
  const { requests } = await run(t, [answer(), answer()], {
    permissions: defineHarnessPermissions({ default: "deny", rules: [] }),
    hooks: [
      defineHarnessHook({
        on: "after-model",
        run() {
          if (changed) return;
          changed = true;
          return {
            result: {
              text: "",
              content: [
                {
                  type: "tool-call",
                  id: "injected",
                  name: "write_file",
                  input: { path: "secret" },
                },
              ],
            },
          };
        },
      }),
    ],
  });
  assert.deepEqual(executed, []);
  assert.match(String(results(requests[1])[0]), /Denied/);
});

test("compaction hooks compose around strategy evaluation", async (t) => {
  const phases: string[] = [];
  await run(
    t,
    [
      (request) => {
        assert.equal(
          JSON.stringify(request.messages),
          JSON.stringify([
            {
              role: "user",
              content: [{ type: "text", text: "after compaction" }],
            },
          ]),
        );
        return { text: done };
      },
    ],
    {
      context: defineHarnessContextStrategy({
        name: "test",
        compact({ messages }) {
          phases.push("strategy");
          assert.match(JSON.stringify(messages), /before compaction/);
          return [
            { role: "user", content: [{ type: "text", text: "compacted" }] },
          ];
        },
      }),
      hooks: [
        defineHarnessHook({
          on: "before-compaction",
          run: () => {
            phases.push("before");
            return {
              messages: [
                {
                  role: "user",
                  content: [{ type: "text", text: "before compaction" }],
                },
              ],
            };
          },
        }),
        defineHarnessHook({
          on: "after-compaction",
          run: ({ messages }) => {
            phases.push("after");
            assert.match(JSON.stringify(messages), /compacted/);
            return {
              messages: [
                {
                  role: "user",
                  content: [{ type: "text", text: "after compaction" }],
                },
              ],
            };
          },
        }),
      ],
    },
  );
  assert.deepEqual(phases, ["before", "strategy", "after"]);
});

test("model transformations reject altered replayable reasoning", async (t) => {
  await assert.rejects(
    run(
      t,
      [
        () => ({
          text: done,
          content: [
            {
              type: "reasoning",
              provider: "test",
              model: "m",
              data: { signature: "signed" },
            },
            { type: "text", text: done },
          ],
        }),
      ],
      {
        hooks: [
          defineHarnessHook({
            on: "after-model",
            run: () => ({
              result: { text: done, content: [{ type: "text", text: done }] },
            }),
          }),
        ],
      },
    ),
    /replayable reasoning/,
  );
});
