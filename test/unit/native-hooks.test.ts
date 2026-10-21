import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defineClaudeHook,
  defineCodexHook,
  defineCopilotHook,
  defineKimiHook,
  defineAntigravityHook,
} from "../../src/core.ts";
import { defineHarnessHook } from "../../src/harness.ts";
import { claudeHookSchemas } from "../../src/adapters/agents/claude/claude-hooks.constants.ts";
import { codexHookSchemas } from "../../src/adapters/agents/codex/codex-hooks.constants.ts";
import { copilotHookSchemas } from "../../src/adapters/agents/copilot/copilot-hooks.constants.ts";
import { kimiHookSchemas } from "../../src/adapters/agents/kimi/kimi-hooks.constants.ts";
import { antigravityHookSchemas } from "../../src/adapters/agents/antigravity/antigravity-hooks.constants.ts";
import { defineNativeHook } from "../../src/adapters/agents/native-hooks.ts";
import type { AgentHookContext } from "../../src/domain/agent-hook.types.ts";
import { validateHookDecision } from "../../src/domain/hook-decision.ts";

const context: AgentHookContext = {
  signal: new AbortController().signal,
  sandbox: {
    root: "/work",
    home: "/home/agent",
    invoke: async () => ({ status: 0, stdout: "", stderr: "" }),
    upload: async () => {},
    download: async () => {},
    release: async () => {},
  },
};

test("all native event schemas accept observation and reject a foreign decision", async () => {
  for (const [agent, schemas] of Object.entries({
    claude: claudeHookSchemas,
    codex: codexHookSchemas,
    copilot: copilotHookSchemas,
    kimi: kimiHookSchemas,
    antigravity: antigravityHookSchemas,
  })) {
    for (const phase of Object.keys(schemas)) {
      const event = {
        session_id: "s",
        hook_event_name: phase,
        cwd: "/work",
        sessionId: "s",
        timestamp: 1,
        conversationId: "s",
        workspacePaths: [],
        tool_name: "tool",
        toolName: "tool",
        prompt: "prompt",
        delta: "text",
      };
      const hook = defineNativeHook<string, string, unknown, unknown>(
        agent,
        schemas,
        {
          on: phase,
          run: () => undefined,
        },
      );
      assert.equal(await hook.run(event, context), "");
      const invalid = defineNativeHook<string, string, unknown, unknown>(
        agent,
        schemas,
        {
          on: phase,
          run: () => ({ inventedDecision: "allow" }),
        },
      );
      await assert.rejects(invalid.run(event, context), /Invalid/);
    }
  }
});

test("native decisions use their CLI's exact fields and nullable inputs", async () => {
  const event = {
    session_id: "s",
    hook_event_name: "Stop",
    cwd: "/work",
    transcript_path: null,
    last_assistant_message: null,
  };
  const codex = defineCodexHook({
    on: "Stop",
    run: () => ({ continue: false, stopReason: "enough" }),
  });
  assert.deepEqual(JSON.parse(await codex.run(event, context)), {
    continue: false,
    stopReason: "enough",
  });
  const copilot = defineCopilotHook({
    on: "permissionRequest",
    run: () => ({ behavior: "deny", message: "policy", interrupt: true }),
  });
  assert.equal(
    JSON.parse(
      await copilot.run(
        {
          sessionId: "s",
          cwd: "/work",
          timestamp: 1,
          toolName: "bash",
          toolArgs: "{}",
        },
        context,
      ),
    ).behavior,
    "deny",
  );
  const kimi = defineKimiHook({
    on: "UserPromptSubmit",
    run: () => "Additional context",
  });
  assert.equal(
    await kimi.run(
      {
        session_id: "s",
        cwd: "/work",
        hook_event_name: "UserPromptSubmit",
        prompt: "hi",
      },
      context,
    ),
    "Additional context",
  );
  const agy = defineAntigravityHook({
    on: "PreToolUse",
    run: () => ({ decision: "deny", reason: "policy" }),
  });
  assert.equal(
    JSON.parse(
      await agy.run({ conversationId: "s", workspacePaths: [] }, context),
    ).decision,
    "deny",
  );
  await assert.rejects(
    codex.run({ ...event, hook_event_name: "SessionStart" }, context),
    /hook event/,
  );
});

test("native options validate handlers, matchers, deadlines and command boundaries", () => {
  for (const options of [
    null,
    { on: "invented", run() {} },
    { on: "Stop" },
    { on: "Stop", run() {}, command: { executable: "node" } },
    { on: "Stop", run() {}, name: " " },
    { on: "Stop", run() {}, matcher: 1 },
    { on: "Stop", run() {}, timeoutMs: 600001 },
    { on: "Stop", run() {}, timeoutMs: 0 },
    { on: "Stop", run() {}, unexpected: true },
  ])
    assert.throws(() => defineClaudeHook(options as never));
  for (const command of [
    null,
    { executable: "" },
    { executable: "node", arguments: [1] },
    { executable: "node", directory: "" },
    { executable: "node", variables: { X: 1 } },
    { executable: "node", shell: true },
  ]) {
    assert.throws(() =>
      defineClaudeHook({ on: "Stop", command: command as never }),
    );
    assert.throws(() =>
      defineHarnessHook({ on: "stop", command: command as never }),
    );
  }
  const command = {
    executable: "node",
    arguments: ["initial"],
    variables: { X: "initial" },
    directory: "/work",
  };
  const hook = defineClaudeHook({ on: "Stop", command });
  command.arguments[0] = "changed";
  command.variables.X = "changed";
  assert.equal(hook.command!.arguments![0], "initial");
  assert.equal(hook.command!.variables!.X, "initial");
});

test("harness decisions reject mixed outcomes, invalid output and forged usage", () => {
  for (const [phase, value] of [
    ["before-prompt", { prompt: "x", deny: "y" }],
    ["before-model", { messages: "x" }],
    ["before-model", { system: 1 }],
    ["after-model", { result: { text: "x", content: "bad" } }],
    ["after-model", { result: { text: "x", usage: {} } }],
    ["after-tool", { result: { content: "x", isError: 1 } }],
    ["run-end", { continue: "x" }],
    ["model-error", {}],
  ] as const)
    assert.throws(() => validateHookDecision(phase, value));
  validateHookDecision("after-tool", { result: "replacement" });
  validateHookDecision("before-tool", { input: { path: "file" } });
});

test("native outputs enforce the byte limit", async () => {
  const hook = defineKimiHook({ on: "Stop", run: () => "é".repeat(524289) });
  await assert.rejects(
    hook.run(
      { session_id: "s", cwd: "/work", hook_event_name: "Stop" },
      context,
    ),
    /size limit/,
  );
});

defineCopilotHook({
  on: "permissionRequest",
  // @ts-expect-error Copilot permission decisions are not Claude decisions.
  run: () => ({ hookSpecificOutput: {} }),
});
defineHarnessHook({
  on: "after-model",
  // @ts-expect-error Usage cannot be replaced by an after-model hook.
  run: () => ({
    result: { text: "x", usage: { input: 0, cached: 0, output: 0 } },
  }),
});

test("Claude display and watch decisions retain hookSpecificOutput nesting", async () => {
  const display = defineClaudeHook({
    on: "MessageDisplay",
    run: () => ({
      hookSpecificOutput: {
        hookEventName: "MessageDisplay",
        displayContent: "redacted",
      },
    }),
  });
  const event = {
    session_id: "s",
    cwd: "/work",
    hook_event_name: "MessageDisplay",
    delta: "secret",
  };
  assert.equal(
    JSON.parse(await display.run(event, context)).hookSpecificOutput
      .displayContent,
    "redacted",
  );
  const watch = defineClaudeHook({
    on: "CwdChanged",
    run: () => ({
      hookSpecificOutput: {
        hookEventName: "CwdChanged",
        watchPaths: ["/work/.env"],
      },
    }),
  });
  assert.deepEqual(
    JSON.parse(
      await watch.run({ ...event, hook_event_name: "CwdChanged" }, context),
    ).hookSpecificOutput.watchPaths,
    ["/work/.env"],
  );
});

test("Codex argument replacement requires an allow decision", async () => {
  const event = {
    session_id: "s",
    cwd: "/work",
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "echo old" },
  };
  const invalid = defineCodexHook({
    on: "PreToolUse",
    run: () => ({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        updatedInput: { command: "echo new" },
      },
    }),
  });
  await assert.rejects(invalid.run(event, context), /hook result/);
  const valid = defineCodexHook({
    on: "PreToolUse",
    run: () => ({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        updatedInput: { command: "echo new" },
      },
    }),
  });
  assert.equal(
    JSON.parse(await valid.run(event, context)).hookSpecificOutput.updatedInput
      .command,
    "echo new",
  );
});

test("harness command error events include a serializable error message", async () => {
  let payload = "";
  const hook = defineHarnessHook({
    on: "model-error",
    command: { executable: "node" },
  });
  await hook.run({
    ...context,
    model: { name: "m" },
    step: 1,
    error: new Error("provider failure"),
    sandbox: {
      ...context.sandbox,
      invoke: async (command) => {
        payload = command.stdin!;
        return { status: 0, stdout: "", stderr: "" };
      },
    },
  });
  assert.deepEqual(JSON.parse(payload).error, {
    name: "Error",
    message: "provider failure",
  });
});
