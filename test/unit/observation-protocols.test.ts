import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
  antigravityHarness,
} from "../../src/index.ts";
import type { AgentObservation } from "../../src/index.ts";
import { agentOutput } from "../../src/application/agent-output.ts";
import { boundedLines } from "../../src/application/output-lines.ts";
import { executionDefaults } from "../../src/application/execution.constants.ts";
import { stopReason } from "../../src/application/stop-reason.ts";
import { OutpostError } from "../../src/domain/errors.ts";

test("Claude normalizes tool ids, results, thinking, partial text and message usage", () => {
  const adapter = agent({ harness: claudeHarness({ partialMessages: true }) });
  assert.ok(
    adapter.request({}).arguments?.includes("--include-partial-messages"),
  );
  assert.ok(
    !adapter
      .request({ interactive: true })
      .arguments?.includes("--include-partial-messages"),
  );
  const events = adapter.events(
    JSON.stringify({
      type: "assistant",
      parent_tool_use_id: "parent",
      message: {
        id: "message",
        usage: { input_tokens: 2 },
        content: [
          { type: "thinking", thinking: "visible" },
          { type: "tool_use", id: "call", name: "Read", input: {} },
        ],
      },
    }),
  );
  assert.equal(events[0]?.kind, "message-usage");
  assert.ok(
    events.some(
      (value) =>
        value.kind === "tool" &&
        value.callId === "call" &&
        value.parentCallId === "parent",
    ),
  );
  assert.ok(
    events.some(
      (value) => value.kind === "reasoning" && value.text === "visible",
    ),
  );
  const result = adapter.events(
    JSON.stringify({
      type: "user",
      parent_tool_use_id: "parent",
      message: {
        content: [
          {
            type: "tool_result",
            tool_use_id: "call",
            is_error: true,
            content: "x".repeat(3000),
          },
        ],
      },
    }),
  )[0];
  assert.ok(result?.kind === "tool-result");
  assert.equal(result.characters, 3000);
  assert.equal(result.preview.length, 2000);
  assert.equal(result.parentCallId, "parent");
  assert.equal(result.isError, true);
  assert.deepEqual(
    adapter.events(
      JSON.stringify({
        type: "stream_event",
        event: { delta: { type: "text_delta", text: "delta" } },
      }),
    ),
    [{ kind: "text-delta", text: "delta" }],
  );
});

test("Codex exposes command failures, MCP results, reasoning and file changes", () => {
  const adapter = agent({ harness: codexHarness() });
  const decode = (type: string, item: unknown) =>
    adapter.events(JSON.stringify({ type, item }));
  const call = decode("item.started", {
    type: "command_execution",
    id: "call",
    command: "false",
  })[0];
  assert.ok(call?.kind === "tool" && call.callId === "call");
  const result = decode("item.completed", {
    type: "command_execution",
    id: "call",
    aggregated_output: "failure",
    exit_code: 7,
  })[0];
  assert.ok(
    result?.kind === "tool-result" &&
      result.isError &&
      result.callId === "call",
  );
  assert.equal(
    decode("item.completed", {
      type: "mcp_tool_call",
      id: "mcp",
      tool: "read",
      result: { ok: true },
    })[0]?.kind,
    "tool-result",
  );
  assert.equal(
    decode("item.completed", { type: "reasoning", text: "visible" })[0]?.kind,
    "reasoning",
  );
  assert.equal(
    decode("item.completed", {
      type: "file_change",
      id: "change",
      changes: [{ path: "x" }],
    })[0]?.kind,
    "file-change",
  );
});

test("Copilot and Kimi correlate results while Antigravity uses conversation and step index", () => {
  const copilot = agent({ harness: copilotHarness() });
  const result = copilot.events(
    JSON.stringify({
      type: "tool.execution_complete",
      data: {
        toolCallId: "call",
        success: false,
        error: { message: "failed" },
      },
    }),
  )[0];
  assert.ok(
    result?.kind === "tool-result" &&
      result.callId === "call" &&
      result.isError,
  );
  const kimi = agent({ harness: kimiHarness() });
  assert.equal(
    kimi.events(
      JSON.stringify({ role: "tool", tool_call_id: "call", content: "ok" }),
    )[0]?.kind,
    "tool-result",
  );
  const antigravity = agent({ harness: antigravityHarness() });
  const decode = (state: string) =>
    antigravity.events(
      JSON.stringify({
        event: "step_update",
        step_update: {
          conversation_id: "session",
          step_index: 3,
          state,
          step_type: "tool",
          tool_name: "shell",
        },
      }),
    )[0];
  const start = decode("ACTIVE"),
    end = decode("DONE");
  assert.ok(start?.kind === "tool" && end?.kind === "tool-result");
  assert.equal(start.callId, end.callId);
  assert.equal(end.preview, "");
});

test("oversized newline-terminated and unterminated UTF-8 lines are reported before failure", () => {
  for (const suffix of ["", "\n"]) {
    const events: AgentObservation[] = [];
    const output = agentOutput(
      agent({ harness: codexHarness() }),
      {
        brief: { text: "test" },
        observe(value) {
          events.push(value);
        },
      },
      [],
      1,
    );
    const line = "é".repeat(executionDefaults.eventBytes / 2 + 1);
    assert.throws(() => output.append(line + suffix), /oversized/);
    assert.equal(events.length, 1);
    assert.ok(events[0]?.kind === "raw" && events[0].truncated);
    assert.equal(events[0].bytes, Buffer.byteLength(line));
    assert.ok(String(events[0].value).length <= 2000);
  }
});

test("stderr buffers split lines, bounds long fragments and flushes the final tail", () => {
  const output: [string, boolean][] = [];
  const lines = boundedLines((text, truncated) =>
    output.push([text, truncated]),
  );
  lines.append("hel");
  lines.append("lo\nworld");
  lines.flush();
  lines.flush();
  assert.deepEqual(output, [
    ["hello", false],
    ["world", false],
  ]);
  lines.append("x".repeat(30000));
  lines.flush();
  assert.ok(output.every(([text]) => text.length <= 8192));
  assert.ok(output.some(([, truncated]) => truncated));
});

test("stop reasons distinguish completion, idle, deadline, external cancellation and oversized events", () => {
  assert.equal(stopReason(undefined, "completion", undefined), "completion");
  assert.equal(
    stopReason(
      undefined,
      new OutpostError("timeout", "idle", { stopReason: "idle-timeout" }),
      undefined,
    ),
    "idle-timeout",
  );
  assert.equal(
    stopReason(undefined, undefined, new OutpostError("timeout", "deadline")),
    "deadline",
  );
  assert.equal(
    stopReason(AbortSignal.abort(), "completion", undefined),
    "aborted",
  );
  assert.equal(
    stopReason(
      undefined,
      new OutpostError("process", "large", { stopReason: "oversized-event" }),
      undefined,
    ),
    "oversized-event",
  );
  assert.equal(stopReason(undefined, undefined, new Error("other")), undefined);
});
