import { CloudCheckError, cloudCommandFailure } from "./cloud-failure.ts";
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
      const login = await lease
        .invoke({
          executable,
          arguments: ["login", "--with-api-key"],
          stdin: value,
          variables,
          signal,
          deadlineMs: 30_000,
        })
        .catch((cause) => {
          throw new CloudCheckError(
            "codex-agent-login",
            "agent-authentication",
            cause,
          );
        });
      if (login.status !== 0)
        throw cloudCommandFailure(
          "codex-agent-login",
          "agent-authentication",
          login,
        );
    }
    const model =
      environment[
        name === "claude" ? "OUTPOST_CLAUDE_MODEL" : "OUTPOST_CODEX_MODEL"
      ];
    const harness =
      name === "claude"
        ? claudeHarness({
            saveConversations: false,
            authentication:
              credential === "CLAUDE_CODE_OAUTH_TOKEN"
                ? { account: { variable: credential } }
                : "usage",
          })
        : codexHarness({ saveConversations: false, authentication: "usage" });
    const adapter = composeAgent({ harness, ...(model ? { model } : {}) });
    const request = adapter.request({
      text: "Reply with exactly OUTPOST_AUTH_OK. Do not use tools or modify any files.",
    });
    const result = await lease
      .invoke({
        ...request,
        arguments: [
          ...(request.arguments ?? []),
          ...(name === "codex" ? ["--skip-git-repo-check"] : []),
        ],
        executable,
        variables,
        signal,
        deadlineMs: 90_000,
        retain: 65536,
      })
      .catch((cause) => {
        throw new CloudCheckError(
          `${name}-authenticated-model-turn`,
          "model-access",
          cause,
        );
      });
    const events = result.stdout
      .split("\n")
      .flatMap((line) => adapter.events(line));
    if (result.status !== 0 || events.some((event) => event.kind === "failure"))
      throw cloudCommandFailure(
        `${name}-authenticated-model-turn`,
        "model-access",
        result,
      );
    const text = events
      .filter((event) => event.kind === "text")
      .map((event) => event.text)
      .join("");
    if (!text.includes("OUTPOST_AUTH_OK"))
      throw new CloudCheckError(
        `${name}-authenticated-model-turn`,
        "model-access",
        new Error("Missing authenticated response"),
      );
    record({ name: `${name}-authenticated-model-turn`, status: "pass" });
  }
}
