import type { AgentDescriptor } from "../agent-descriptor.types.ts";
import { createCodexHarness } from "./codex-adapter.ts";
import { codexCredentialVariables, codexLabel } from "./codex.constants.ts";
import { codexDiagnostics } from "./codex-diagnostics.ts";
import { codexProtocolFixtures } from "./codex-protocol.constants.ts";

export const codexAgent = {
  name: "codex",
  label: codexLabel,
  executable: "codex",
  version: "0.156.1",
  harnessExport: "createCodexHarness",
  harness: createCodexHarness,
  install: { kind: "npm", package: "@openai/codex" },
  doctor: { diagnostics: codexDiagnostics },
  protocol: codexProtocolFixtures,
  customModelProvider: true,
  authentication: [
    {
      value: "account",
      label: "ChatGPT account (codex login, file storage)",
      instructions:
        'Run codex login on the host with cli_auth_credentials_store = "file". Isolated sandboxes receive a private copy of auth.json; the local provider uses the host login. This uses your ChatGPT plan.',
    },
    {
      value: "usage",
      label: "OpenAI API key (API billing)",
      variable: codexCredentialVariables.usage,
      instructions: `Set ${codexCredentialVariables.usage} in the workflow .env or parent environment. API usage is billed separately from subscriptions.`,
    },
  ],
} as const satisfies AgentDescriptor;
