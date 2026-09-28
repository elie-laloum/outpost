import assert from "node:assert/strict";
import { test } from "node:test";
import { turn } from "../../src/application/agent-turn.ts";
import {
  agent,
  antigravityHarness,
  anthropicModelProvider,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
  openaiModelProvider,
  OutpostError,
} from "../../src/index.ts";
import { quotaFault } from "../../src/domain/quota.ts";
import type { CliAgent } from "../../src/domain/agent.types.ts";
import type { CommandResult } from "../../src/domain/command.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import { scripted } from "../helpers.ts";

test("Claude decodes rejected rate-limit events and quota assistant errors", () => {
  const claude = agent({ harness: claudeHarness() });
  const [rejected] = claude.events(
    JSON.stringify({
      type: "rate_limit_event",
      rate_limit_info: {
        status: "rejected",
        resetsAt: 1_790_000_000,
        rateLimitType: "five_hour",
      },
    }),
  );
  assert.deepEqual(rejected, {
    kind: "quota",
    message: "Claude Code five_hour limit reached",
    resetAt: new Date(1_790_000_000_000).toISOString(),
  });
  for (const status of ["allowed", "allowed_warning"])
    assert.equal(
      claude.events(
        JSON.stringify({
          type: "rate_limit_event",
          rate_limit_info: { status, resetsAt: 1_790_000_000 },
        }),
      )[0]?.kind,
      "raw",
    );
  assert.deepEqual(
    claude.events(
      JSON.stringify({
        type: "assistant",
        error: "rate_limit",
        message: { content: [{ type: "text", text: "limit" }] },
      }),
    ),
    [
      { kind: "quota", message: "Claude Code reported rate_limit" },
      { kind: "text", text: "limit" },
    ],
  );
  assert.equal(
    claude.events(
      JSON.stringify({ type: "assistant", error: "overloaded", message: {} }),
    )[0]?.kind,
    "raw",
  );
});

test("Copilot classifies quota and rate-limit session errors only", () => {
  const copilot = agent({ harness: copilotHarness() });
  const decode = (errorType: string) =>
    copilot.events(
      JSON.stringify({
        type: "session.error",
        data: { errorType, message: "You've hit your rate limit." },
      }),
    )[0]?.kind;
  assert.equal(decode("quota"), "quota");
  assert.equal(decode("rate_limit"), "quota");
  assert.equal(decode("authentication"), "warning");
});

test("CLI adapters recognize terminal quota text and ignore transient notices", () => {
  const cases: readonly [CliAgent, readonly string[], readonly string[]][] = [
    [
      agent({ harness: claudeHarness() }),
      [
        "You've hit your session limit · resets 3pm (Europe/Paris)",
        "You’ve hit your weekly limit",
        "Claude AI usage limit reached|1790000000",
        "Request rejected (429)",
      ],
      [
        "Server is temporarily limiting requests (not your usage limit)",
        "Agent failed",
      ],
    ],
    [
      agent({ harness: codexHarness() }),
      [
        "You've hit your usage limit. Upgrade to Pro. Try again at 3:04 PM.",
        "Quota exceeded",
        "exceeded retry limit, last status: 429 Too Many Requests",
      ],
      ["Reconnecting... 1/5", "stream disconnected before completion"],
    ],
    [
      agent({ harness: copilotHarness() }),
      [
        "You've reached your weekly rate limit.",
        "You've run out of your included AI credits for the month.",
      ],
      ["GitHub Copilot CLI ended with exit code 1"],
    ],
    [
      agent({ harness: kimiHarness() }),
      [
        "provider.api_error: exceeded_current_quota_error",
        "You exceeded your current token quota, please check your account balance",
      ],
      ["tool call failed"],
    ],
    [
      agent({ harness: antigravityHarness() }),
      ["You have exhausted your quota on this model.", "RESOURCE_EXHAUSTED"],
      ["Antigravity ended the turn with status ERROR"],
    ],
  ];
  for (const [adapter, quota, other] of cases) {
    for (const text of quota)
      assert.equal(adapter.quota?.(text), true, `${adapter.name}: ${text}`);
    for (const text of other)
      assert.equal(adapter.quota?.(text), false, `${adapter.name}: ${text}`);
  }
});

function lease(
  stdout: readonly object[],
  outcome: CommandResult | OutpostError,
  stderr = "",
): SandboxLease {
  return {
    root: "/fixture",
    home: "/fixture",
    async invoke(command) {
      for (const line of stdout)
        command.observe?.("stdout", JSON.stringify(line) + "\n");
      if (stderr) command.observe?.("stderr", stderr);
      if (outcome instanceof OutpostError) throw outcome;
      return outcome;
    },
    async upload() {},
    async download() {},
    async release() {},
  };
}

const quotaAgent: CliAgent = {
  ...scripted(""),
  quota: (text) => /usage limit/.test(text),
};

const run = (sandbox: SandboxLease, adapter: CliAgent = quotaAgent) =>
  turn(
    sandbox,
    adapter,
    "test",
    { brief: { text: "test" } },
    undefined,
    [],
    1,
    {
      repository: "/fixture",
      repair: false,
    },
  );

test("a failed turn with a quota signal becomes a quota error with its reset", async () => {
  const resetAt = "2026-09-28T18:00:00.000Z";
  await assert.rejects(
    run(
      lease(
        [
          { kind: "conversation", id: "session" },
          { kind: "quota", message: "limit reached", resetAt },
          { kind: "failure", message: "You hit your usage limit" },
        ],
        { status: 1, stdout: "", stderr: "" },
      ),
    ),
    (error) => {
      assert.ok(error instanceof OutpostError);
      assert.equal(error.code, "quota");
      assert.equal(error.message, "You hit your usage limit");
      assert.equal(error.details.resetAt, resetAt);
      assert.equal(error.details.agent, "fixture");
      assert.equal(error.details.conversation, "session");
      assert.ok(error.cause instanceof OutpostError);
      assert.equal(error.cause.code, "process");
      assert.deepEqual(quotaFault(error), {
        message: "You hit your usage limit",
        resetAt,
        conversation: "session",
      });
      return true;
    },
  );
});

test("quota text on stderr or in a zero-status failure is classified", async () => {
  await assert.rejects(
    run(
      lease([], { status: 1, stdout: "", stderr: "" }, "Error: usage limit\n"),
    ),
    (error) =>
      error instanceof OutpostError &&
      error.code === "quota" &&
      error.message === "Error: usage limit" &&
      error.details.resetAt === undefined,
  );
  await assert.rejects(
    run(
      lease([{ kind: "failure", message: "usage limit" }], {
        status: 0,
        stdout: "",
        stderr: "",
      }),
    ),
    (error) => error instanceof OutpostError && error.code === "quota",
  );
});

test("failures without a quota signal and non-process errors keep their code", async () => {
  await assert.rejects(
    run(
      lease([{ kind: "failure", message: "compile error" }], {
        status: 1,
        stdout: "",
        stderr: "",
      }),
    ),
    (error) => error instanceof OutpostError && error.code === "process",
  );
  await assert.rejects(
    run(lease([], { status: 1, stdout: "", stderr: "" }, "usage limit\n"), {
      ...scripted(""),
    }),
    (error) => error instanceof OutpostError && error.code === "process",
  );
  const timeout = new OutpostError("timeout", "Command exceeded 10 ms");
  await assert.rejects(
    run(lease([{ kind: "quota", message: "limit" }], timeout)),
    (error) => error === timeout,
  );
});

test("a quota signal does not affect a successful turn", async () => {
  const result = await run(
    lease(
      [
        { kind: "quota", message: "limit" },
        { kind: "result", text: "done" },
      ],
      { status: 0, stdout: "", stderr: "" },
    ),
  );
  assert.equal(result.text, "done");
});

test("HTTP 429 is classified as quota for both model providers", async (t) => {
  const now = Date.now();
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(null, { status: 429, headers: { "Retry-After": "60" } }),
  );
  for (const provider of [
    openaiModelProvider({ apiKey: false, baseUrl: "http://localhost" }),
    anthropicModelProvider({ apiKey: "test", baseUrl: "http://localhost" }),
  ])
    await assert.rejects(
      provider.request({ model: "test", prompt: "hi", maxOutputTokens: 1 }),
      (error) => {
        assert.ok(error instanceof OutpostError);
        assert.equal(error.code, "quota");
        assert.equal(error.details.retryAfterMs, 60_000);
        const reset = Date.parse(String(error.details.resetAt));
        assert.ok(reset >= now + 60_000 && reset <= Date.now() + 60_000);
        return true;
      },
    );
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  );
  await assert.rejects(
    openaiModelProvider({ apiKey: false, baseUrl: "http://localhost" }).request(
      { model: "test", prompt: "hi", maxOutputTokens: 1 },
    ),
    (error) =>
      error instanceof OutpostError &&
      error.code === "provider" &&
      quotaFault(error) === undefined,
  );
});

test("quotaFault follows wrapped causes and ignores other failures", () => {
  const quota = new OutpostError("quota", "limit", { resetAt: "invalid" });
  assert.deepEqual(quotaFault(new Error("wrapped", { cause: quota })), {
    message: "limit",
  });
  assert.equal(quotaFault(new OutpostError("process", "failed")), undefined);
  assert.equal(quotaFault("limit"), undefined);
});
