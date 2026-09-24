import assert from "node:assert/strict";
import { test } from "node:test";
import { gemini } from "../../src/index.ts";
import { prepareAdapter } from "../../src/application/agent-bootstrap.ts";
import { diagnoseAgentCli } from "../../src/application/doctor-agent.ts";
import { geminiDiagnostics } from "../../src/adapters/agents/gemini-diagnostics.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";

test("Gemini requests preserve stdin and terminal boundaries, model, variables and approval choices", () => {
  const variables = { GEMINI_API_KEY: "fixture" };
  const agent = gemini({ model: "flash", variables });
  variables.GEMINI_API_KEY = "changed";
  assert.equal(agent.variables?.GEMINI_API_KEY, "fixture");
  assert.ok(Object.isFrozen(agent));
  assert.ok(Object.isFrozen(agent.variables));
  assert.equal(agent.resumable, false);
  assert.equal(agent.capture, false);
  assert.equal(agent.conversations, undefined);
  assert.equal(agent.storage, undefined);
  assert.deepEqual(agent.request({ text: "-literal\nsecond line" }), {
    executable: "gemini",
    arguments: [
      "--model",
      "flash",
      "--approval-mode",
      "yolo",
      "--output-format",
      "stream-json",
    ],
    stdin: "-literal\nsecond line",
  });
  assert.deepEqual(gemini().request({ interactive: true }), {
    executable: "gemini",
    arguments: ["--approval-mode", "default"],
    interactive: true,
  });
  assert.deepEqual(
    gemini({ approvalMode: "plan" }).request({
      interactive: true,
      text: "Inspect",
    }),
    {
      executable: "gemini",
      arguments: ["--approval-mode", "plan", "--prompt-interactive", "Inspect"],
      interactive: true,
    },
  );
  assert.deepEqual(
    gemini({ approvalMode: "auto_edit" }).request({}).arguments,
    ["--approval-mode", "auto_edit", "--output-format", "stream-json"],
  );
  assert.equal(gemini().request({}).stdin, "");
  for (const fork of [true, false])
    assert.throws(
      () => agent.request({ continuation: { id: "session", fork } }),
      /does not support continuation or fork/,
    );
});

test("Gemini decodes assistant deltas and final totals while retaining tool results and unknown payloads", () => {
  const agent = gemini();
  const decode = (value: unknown) => agent.events(JSON.stringify(value));
  assert.deepEqual(
    decode({
      type: "message",
      role: "assistant",
      content: "hello",
      delta: true,
    }),
    [{ kind: "text", text: "hello" }],
  );
  assert.deepEqual(
    decode({
      type: "result",
      status: "success",
      stats: {
        input_tokens: 12,
        input: 7,
        cached: 5,
        output_tokens: 3,
        models: { one: { input_tokens: 12 } },
      },
    }),
    [
      { kind: "usage", tokens: { input: 12, cached: 5, output: 3 } },
      { kind: "finished" },
    ],
  );
  assert.deepEqual(
    decode({
      type: "result",
      status: "success",
      stats: { input_tokens: "bad" },
    }),
    [
      { kind: "usage", tokens: { input: 0, cached: 0, output: 0 } },
      { kind: "finished" },
    ],
  );
  assert.deepEqual(decode({ type: "result", status: "error" }), [
    { kind: "failure", message: "Gemini failed" },
  ]);
  for (const severity of ["warning", "error"])
    assert.deepEqual(decode({ type: "error", severity, message: "problem" }), [
      {
        kind: severity === "warning" ? "warning" : "failure",
        message: "problem",
      },
    ]);
  for (const value of [
    { type: "init" },
    { type: "message", role: "user", content: "prompt" },
    { type: "message", role: "assistant", content: 42 },
    { type: "tool_use" },
    {
      type: "tool_result",
      tool_id: "call",
      status: "error",
      error: { message: "retryable tool failure" },
    },
    { type: "error" },
    { type: "result", status: "unexpected" },
  ])
    assert.deepEqual(decode(value), [{ kind: "raw", value }]);
});

test("Gemini CLI help diagnostics inspect only the supported fresh-session invocation", async () => {
  const plans = geminiDiagnostics();
  assert.equal(plans.length, 1);
  assert.equal(plans[0]?.command.stdin, "");
  let calls = 0;
  const checks = await diagnoseAgentCli("gemini", async (command) => {
    calls++;
    assert.equal(command.executable, "gemini");
    assert.deepEqual(command.arguments, ["--help"]);
    assert.equal(command.arguments?.at(-1), "--help");
    return {
      status: 0,
      stdout:
        "Usage: gemini [options] [command]\n  --approval-mode  Approval\n  -o, --output-format Output\n",
      stderr: "",
    };
  });
  assert.equal(calls, 1);
  assert.equal(checks[0]?.status, "pass");
});

test("Gemini remote bootstrap is independent of native transcript storage", async () => {
  const agent = gemini();
  const lease: SandboxLease = {
    root: "/workspace",
    home: "/home/agent",
    async invoke(command) {
      assert.match(
        command.arguments?.[1] ?? "",
        /@google\/gemini-cli@0\.61\.0/,
      );
      return {
        status: 0,
        stdout: "/home/agent/.outpost-tools/bin/gemini\n",
        stderr: "",
      };
    },
    async upload() {},
    async download() {},
    async release() {},
  };
  const prepared = await prepareAdapter(
    agent,
    lease,
    new AbortController().signal,
  );
  assert.equal(
    prepared.request({ text: "hello" }).executable,
    "/home/agent/.outpost-tools/bin/gemini",
  );
  assert.equal(prepared.capture, false);
  assert.equal(prepared.requiresFinishedEvent, true);
  await assert.rejects(
    prepareAdapter(
      { ...agent, bootstrap: "unrecognized" },
      lease,
      new AbortController().signal,
    ),
    /Unknown agent bootstrap/,
  );
});
