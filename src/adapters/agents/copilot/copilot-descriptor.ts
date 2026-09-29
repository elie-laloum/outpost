import type { AgentDescriptor } from "../agent-descriptor.types.ts";
import { createCopilotHarness } from "./copilot-adapter.ts";
import {
  copilotCredentialVariables,
  copilotLabel,
} from "./copilot.constants.ts";
import { copilotDiagnostics } from "./copilot-diagnostics.ts";
import { copilotProtocolFixtures } from "./copilot-protocol.constants.ts";

export const copilotAgent = {
  name: "copilot",
  label: copilotLabel,
  executable: "copilot",
  version: "1.0.88",
  harnessExport: "createCopilotHarness",
  harness: createCopilotHarness,
  install: { kind: "npm", package: "@github/copilot" },
  image: {
    note: "The private home is a noexec tmpfs; Copilot extracts native addons into its cache.",
    variables: { XDG_CACHE_HOME: "/tmp/.cache" },
  },
  doctor: { diagnostics: copilotDiagnostics },
  protocol: copilotProtocolFixtures,
  authentication: [
    {
      value: "account",
      label: "GitHub Copilot login (copilot login)",
      instructions: `Run copilot login on the host. Outpost passes the token stored in ~/.copilot/config.json as ${copilotCredentialVariables.account}; tokens kept in the system keychain are never read: choose account-token there.`,
    },
    {
      value: "account-token",
      label: `GitHub token with Copilot access (${copilotCredentialVariables.account})`,
      variable: copilotCredentialVariables.account,
      instructions: `Set ${copilotCredentialVariables.account} to a fine-grained token with the Copilot Requests permission in the workflow .env or parent environment. Classic ghp_ tokens are rejected. Requests count against your Copilot plan.`,
    },
  ],
} as const satisfies AgentDescriptor;
