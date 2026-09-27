import { CloudCheckError } from "../fixtures/cloud-failure.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Command } from "../../src/domain/command.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import type { CompatibilityCheck } from "../fixtures/cloud-compatibility.types.ts";
import { verifyCloudModels } from "../fixtures/cloud-model-contract.ts";

test("authenticated cloud fixture transmits selected credentials and validates native model responses", async () => {
  const calls: Command[] = [];
  const checks: CompatibilityCheck[] = [];
  const lease: SandboxLease = {
    root: "/workspace",
    home: "/home/agent",
    upload: async () => {},
    download: async () => {},
    release: async () => {},
    invoke: async (command) => {
      calls.push(command);
      const stdout = command.executable.endsWith("claude")
        ? JSON.stringify({
            type: "assistant",
            message: { content: [{ type: "text", text: "OUTPOST_AUTH_OK" }] },
          })
        : JSON.stringify({
            type: "item.completed",
            item: { type: "agent_message", text: "OUTPOST_AUTH_OK" },
          });
      return { status: 0, stdout, stderr: "" };
    },
  };
  await verifyCloudModels(
    lease,
    {
      CLAUDE_CODE_OAUTH_TOKEN: "test-subscription",
      ANTHROPIC_API_KEY: "unused-api-key",
      OPENAI_API_KEY: "test-api-key",
      OUTPOST_CLAUDE_MODEL: "claude-haiku-4-5",
      OUTPOST_CODEX_MODEL: "gpt-5.6-luna",
    },
    new AbortController().signal,
    (check) => checks.push(check),
  );
  assert.equal(checks.filter((check) => check.status === "pass").length, 2);
  assert.deepEqual(calls[0]?.variables, {
    CLAUDE_CODE_OAUTH_TOKEN: "test-subscription",
  });
  assert.deepEqual(calls[1]?.arguments, ["login", "--with-api-key"]);
  assert.equal(calls[1]?.stdin, "test-api-key");
  assert.deepEqual(calls[2]?.variables, { OPENAI_API_KEY: "test-api-key" });
  assert.ok(!JSON.stringify(checks).includes("test-api-key"));
  assert.ok(calls[0]?.arguments?.includes("claude-haiku-4-5"));
  assert.ok(calls[2]?.arguments?.includes("gpt-5.6-luna"));
  assert.ok(calls[2]?.arguments?.includes("--skip-git-repo-check"));
  calls.length = 0;
  checks.length = 0;
  await verifyCloudModels(lease, {}, new AbortController().signal, (check) =>
    checks.push(check),
  );
  assert.equal(calls.length, 0);
  assert.ok(checks.every((check) => check.status === "skipped"));
  await assert.rejects(
    verifyCloudModels(
      {
        ...lease,
        invoke: async () => ({ status: 1, stdout: "", stderr: "sensitive" }),
      },
      { OPENAI_API_KEY: "test" },
      new AbortController().signal,
      () => {},
    ),
    /codex-agent-login: contract-failed/,
  );
});

for (const scenario of [
  {
    name: "authentication",
    output: {
      type: "result",
      is_error: true,
      errors: [{ type: "authentication_error", message: "private-secret" }],
    },
    status: 1,
    category: "agent-authentication",
    reason: "authentication-rejected",
  },
  {
    name: "quota",
    output: {
      type: "result",
      is_error: true,
      errors: [{ code: "insufficient_quota", message: "private-secret" }],
    },
    status: 0,
    category: "model-access",
    reason: "quota-exceeded",
  },
  {
    name: "model access",
    output: {
      type: "error",
      error: { type: "not_found_error", message: "private-secret" },
    },
    status: 1,
    category: "model-access",
    reason: "model-unavailable",
  },
  {
    name: "network",
    output: {
      type: "error",
      error: { code: "ECONNRESET", message: "private-secret" },
    },
    status: 1,
    category: "network",
    reason: "network-unreachable",
  },
]) {
  test(`cloud model fixture classifies native ${scenario.name} failures without logging responses`, async () => {
    const lease: SandboxLease = {
      root: "/workspace",
      home: "/home/agent",
      upload: async () => {},
      download: async () => {},
      release: async () => {},
      invoke: async () => ({
        status: scenario.status,
        stdout: JSON.stringify(scenario.output),
        stderr: "private-secret",
      }),
    };
    await assert.rejects(
      verifyCloudModels(
        lease,
        {
          ANTHROPIC_API_KEY: "private-secret",
          OUTPOST_CLAUDE_MODEL: "claude-haiku-4-5",
          OUTPOST_CLOUD_MODEL_AGENTS: "claude",
        },
        new AbortController().signal,
        () => {},
      ),
      (error) => {
        assert.ok(error instanceof CloudCheckError);
        assert.equal(error.check.name, "claude-authenticated-model-turn");
        assert.equal(error.check.category, scenario.category);
        assert.equal(error.check.reason, scenario.reason);
        assert.doesNotMatch(JSON.stringify(error.check), /private-secret/);
        return true;
      },
    );
  });
}
