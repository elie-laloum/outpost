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
    /login failed/,
  );
});
