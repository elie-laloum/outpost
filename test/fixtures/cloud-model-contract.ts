import { agent as composeAgent } from "../../src/domain/agent.ts";
import assert from "node:assert/strict";
import { posix } from "node:path";
import { claudeHarness } from "../../src/adapters/agents/claude-adapter.ts";
import { codexHarness } from "../../src/adapters/agents/codex-adapter.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import type { CompatibilityCheck } from "./cloud-compatibility.types.ts";

export async function verifyCloudModels(
  lease: SandboxLease,
  environment: Readonly<Record<string, string | undefined>>,
  signal: AbortSignal,
  record: (check: CompatibilityCheck) => void,
): Promise<void> {
  const selected = (
    environment.OUTPOST_CLOUD_MODEL_AGENTS ?? "claude,codex"
  ).split(",");
  assert.ok(
    selected.length &&
      selected.every((name) => name === "claude" || name === "codex"),
    "Unknown model agent",
  );
  for (const name of new Set(selected)) {
    const credential =
      name === "codex"
        ? "OPENAI_API_KEY"
        : environment.CLAUDE_CODE_OAUTH_TOKEN
          ? "CLAUDE_CODE_OAUTH_TOKEN"
          : "ANTHROPIC_API_KEY";
    const value = environment[credential];
    if (!value) {
      record({
        name: `${name}-authenticated-model-turn`,
        status: "skipped",
        reason: "credentials-unavailable",
      });
      continue;
    }
    const variables = { [credential]: value };
    const executable = posix.join(
      lease.root,
      "cli-tools",
      "node_modules",
      ".bin",
      name,
    );
    if (name === "codex") {
      const login = await lease.invoke({
        executable,
        arguments: ["login", "--with-api-key"],
        stdin: value,
        variables,
        signal,
        deadlineMs: 30_000,
      });
      assert.equal(login.status, 0, "Codex API-key login failed");
    }
    const model =
      environment[
        name === "claude" ? "OUTPOST_CLAUDE_MODEL" : "OUTPOST_CODEX_MODEL"
      ];
    const settings = { saveConversations: false, ...(model ? { model } : {}) };
    const adapter =
      name === "claude"
        ? composeAgent({ harness: claudeHarness(settings) })
        : composeAgent({ harness: codexHarness(settings) });
    const request = adapter.request({
      text: "Reply with exactly OUTPOST_AUTH_OK. Do not use tools or modify any files.",
    });
    const result = await lease.invoke({
      ...request,
      executable,
      variables,
      signal,
      deadlineMs: 90_000,
      retain: 65536,
    });
    assert.equal(
      result.status,
      0,
      `${name} authenticated model command failed`,
    );
    const text = result.stdout
      .split("\n")
      .flatMap((line) => adapter.events(line))
      .filter((event) => event.kind === "text")
      .map((event) => event.text)
      .join("");
    assert.ok(
      text.includes("OUTPOST_AUTH_OK"),
      `${name} returned no authenticated response`,
    );
    record({ name: `${name}-authenticated-model-turn`, status: "pass" });
  }
}
