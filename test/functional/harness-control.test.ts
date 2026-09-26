import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  defineHarnessHook,
  defineHarnessPermissions,
  defineHarnessTool,
  dispatch,
  harness,
  type AgentObservation,
  type CustomHarnessOptions,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
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
  options: Omit<CustomHarnessOptions, "modelProvider" | "tools">,
  extra: Partial<Parameters<typeof dispatch>[0]> = {},
) {
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const root = await repository(t);
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "m",
      harness: harness({
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
      harness({
        modelProvider: provider([], []),
        // @ts-expect-error Hooks must be defined with defineHarnessHook.
        hooks: [{ on: "stop", run: () => undefined }],
      }),
    /defineHarnessHook/,
  );
  assert.throws(
    () =>
      harness({
        modelProvider: provider([], []),
        // @ts-expect-error Permissions must be defined with defineHarnessPermissions.
        permissions: { rules: [] },
      }),
    /defineHarnessPermissions/,
  );
});
