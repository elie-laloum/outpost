import { agent as composeAgent } from "../../src/domain/agent.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareBrief, validateBrief } from "../../src/domain/prompts.ts";
import { response, ResponseError } from "../../src/domain/response.ts";
import { claude, codex } from "../../src/providers/agents.ts";
import { parseEnvironment } from "../../src/infrastructure/settings.ts";
import { OutpostError } from "../../src/domain/errors.ts";

test("file prompts preserve command provenance and validate variables", () => {
  const builtins = { WORK_BRANCH: "feature", BASE_BRANCH: "main" };
  const result = prepareBrief(
    "{{INPUT}} !`echo {{N}}` {{WORK_BRANCH}}",
    { INPUT: "!`unsafe`", N: 2, UNUSED: false },
    builtins,
  );
  assert.deepEqual(result.fragments, [
    { kind: "literal", value: "!`unsafe` " },
    { kind: "command", value: "echo 2" },
    { kind: "literal", value: " feature" },
  ]);
  assert.deepEqual(result.unused, ["UNUSED"]);
  assert.throws(() => prepareBrief("{{MISSING}}", {}, builtins), /Missing/);
  assert.throws(
    () => prepareBrief("", { BASE_BRANCH: "override" }, builtins),
    /Reserved/,
  );
});

test("brief variants are exclusive at runtime", () => {
  validateBrief({ text: "" });
  validateBrief({ file: "prompt.md" });
  validateBrief(undefined, true);
  for (const value of [
    undefined,
    {},
    { text: "a", file: "b" },
    { text: "a", values: {} },
  ])
    assert.throws(() => validateBrief(value as never), OutpostError);
});

test("tagged responses support async Standard Schema and take last complete tag", async () => {
  assert.equal(
    await response
      .text({ tag: "answer" })
      .read("<answer>first</answer><answer> last </answer>"),
    "last",
  );
  const json = response.json({
    tag: "data",
    schema: {
      "~standard": {
        validate: async (input) => ({ value: input as { ok: boolean } }),
      },
    },
  });
  assert.deepEqual(await json.read('<data>{"ok":true}</data>'), { ok: true });
  await assert.rejects(json.read("<data>{no}</data>"), ResponseError);
  await assert.rejects(json.read("none"), /No complete/);
  const rejected = response.json({
    tag: "data",
    schema: { "~standard": { validate: () => ({ issues: ["wrong"] }) } },
  });
  await assert.rejects(rejected.read("<data>null</data>"), /wrong/);
  assert.throws(() => response.text({ tag: "x.*" }), /XML/);
  assert.throws(() => response.text({ tag: "ok", repairs: -1 }), /nonnegative/);
});

test("Claude adapter supports print, terminal, reasoning, resume and fork", () => {
  const agent = composeAgent({
    harness: claude.harness({
      reasoning: "high",
      permissions: "acceptEdits",
      saveConversations: false,
      variables: { TOKEN: "value" },
    }),
    model: "model",
  });
  const command = agent.request({
    text: "literal",
    continuation: { id: "abc", fork: true },
  });
  assert.equal(command.stdin, "literal");
  for (const flag of [
    "--print",
    "--model",
    "--effort",
    "--permission-mode",
    "--resume",
    "--fork-session",
  ])
    assert.ok(command.arguments?.includes(flag));
  assert.equal(agent.capture, false);
  assert.equal(
    agent.request({ interactive: true, text: "hello" }).interactive,
    true,
  );
  assert.ok(
    composeAgent({ harness: claude.harness({}) })
      .request({ text: "" })
      .arguments?.includes("--dangerously-skip-permissions"),
  );
  assert.throws(
    () => agent.request({ continuation: { id: "../bad" } }),
    /identifier/,
  );
});

test("agent streams normalize text, tools, sessions, usage and failures", () => {
  const c = composeAgent({ harness: claude.harness({}) }),
    x = composeAgent({ harness: codex.harness({}) });
  const parse = (a: typeof c, value: unknown) =>
    a.events(JSON.stringify(value));
  assert.deepEqual(parse(c, { type: "system", session_id: "a" }), [
    { kind: "conversation", id: "a" },
  ]);
  assert.deepEqual(
    parse(c, {
      type: "assistant",
      message: {
        content: [
          { type: "text", text: "hi" },
          { type: "tool_use", name: "Read", input: {} },
        ],
      },
    }),
    [
      { kind: "text", text: "hi" },
      { kind: "tool", name: "Read", input: {} },
    ],
  );
  assert.deepEqual(
    parse(c, {
      type: "result",
      usage: {
        input_tokens: 3,
        output_tokens: 4,
        cache_read_input_tokens: 2,
        cache_creation_input_tokens: 1,
      },
    })[0],
    {
      kind: "usage",
      tokens: { input: 3, cached: 2, cacheCreated: 1, output: 4 },
    },
  );
  assert.equal(
    parse(c, { type: "result", is_error: true, result: "bad" })[0]?.kind,
    "failure",
  );
  assert.deepEqual(parse(x, { type: "thread.started", thread_id: "b" }), [
    { kind: "conversation", id: "b" },
  ]);
  assert.deepEqual(
    parse(x, {
      type: "item.completed",
      item: { type: "agent_message", text: "hi" },
    }),
    [{ kind: "text", text: "hi" }],
  );
  assert.equal(
    parse(x, {
      type: "item.started",
      item: { type: "command_execution", command: "ls" },
    })[0]?.kind,
    "tool",
  );
  assert.equal(
    parse(x, {
      type: "item.started",
      item: { type: "mcp_tool_call", tool: "Read" },
    })[0]?.kind,
    "tool",
  );
  assert.deepEqual(parse(x, { type: "turn.completed", usage: {} })[0], {
    kind: "usage",
    tokens: { input: 0, cached: 0, output: 0 },
  });
  for (const type of ["error", "turn.failed"])
    assert.equal(
      parse(x, { type, error: { message: "bad" } })[0]?.kind,
      "failure",
    );
  for (const agent of [c, x]) {
    assert.equal(agent.events("not json")[0]?.kind, "raw");
    assert.equal(parse(agent, { type: "other" })[0]?.kind, "raw");
  }
});

test("Codex adapter selects CLI subcommands and explicit reviewer", () => {
  const agent = composeAgent({
    harness: codex.harness({
      reasoning: "high",
      approvalReviewer: "auto_review",
    }),
    model: "model",
  });
  const command = agent.request({
    text: "hi",
    continuation: { id: "abc", fork: true },
  });
  assert.deepEqual(command.arguments?.slice(-5), [
    "exec",
    "fork",
    "abc",
    "--json",
    "-",
  ]);
  assert.ok(command.arguments?.includes('approvals_reviewer="auto_review"'));
  assert.ok(
    composeAgent({ harness: codex.harness({}) })
      .request({})
      .arguments?.includes("--dangerously-bypass-approvals-and-sandbox"),
  );
  assert.ok(
    agent
      .request({ interactive: true, text: "hi", continuation: { id: "abc" } })
      .arguments?.includes("resume"),
  );
  assert.equal(agent.request({ interactive: true }).stdin, undefined);
});

test("dotenv handles export, quotes, escapes and comments without expansion", () => {
  assert.deepEqual(
    parseEnvironment(
      "export A=\"hello\\nworld\"\nB=value # comment\nC='literal $A'\ninvalid\n#comment",
    ),
    { A: "hello\nworld", B: "value", C: "literal $A" },
  );
});
