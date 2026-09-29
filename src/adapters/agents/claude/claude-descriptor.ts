import type { AgentDescriptor } from "../agent-descriptor.types.ts";
import { createClaudeHarness } from "./claude-adapter.ts";
import { claudeCredentialVariables, claudeLabel } from "./claude.constants.ts";
import { claudeDiagnostics } from "./claude-diagnostics.ts";
import { claudeProtocolFixtures } from "./claude-protocol.constants.ts";

export const claudeAgent = {
  name: "claude",
  label: claudeLabel,
  executable: "claude",
  version: "2.1.280",
  harnessExport: "createClaudeHarness",
  harness: createClaudeHarness,
  install: {
    kind: "npm",
    package: "@anthropic-ai/claude-code",
    allowScripts: true,
  },
  doctor: { diagnostics: claudeDiagnostics },
  protocol: claudeProtocolFixtures,
  authentication: [
    {
      value: "account",
      label: "Claude subscription login (claude /login)",
      instructions:
        "Run claude and /login on the host. Isolated sandboxes receive only the subscription entry of .credentials.json. Logins stored in the macOS keychain are never read: choose account-token there.",
    },
    {
      value: "account-token",
      label: "Claude subscription token (claude setup-token)",
      variable: claudeCredentialVariables.account,
      instructions: `Run claude setup-token on the host, then set ${claudeCredentialVariables.account} in the workflow .env or parent environment. This uses your Claude subscription.`,
    },
    {
      value: "usage",
      label: "Anthropic API key (API billing)",
      variable: claudeCredentialVariables.usage,
      instructions: `Set ${claudeCredentialVariables.usage} in the workflow .env or parent environment. API usage is billed separately from subscriptions.`,
    },
  ],
} as const satisfies AgentDescriptor;
