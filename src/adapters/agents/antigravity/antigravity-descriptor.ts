import type { AgentDescriptor } from "../agent-descriptor.types.ts";
import { createAntigravityHarness } from "./antigravity-adapter.ts";
import {
  antigravityCredentialVariables,
  antigravityLabel,
  antigravityVariables,
} from "./antigravity.constants.ts";
import { antigravityDiagnostics } from "./antigravity-diagnostics.ts";
import { antigravityInstall } from "./antigravity-install.ts";
import { antigravityProtocolFixtures } from "./antigravity-protocol.constants.ts";

export const antigravityAgent = {
  name: "antigravity",
  label: antigravityLabel,
  executable: "agy",
  version: "1.2.12",
  harnessExport: "createAntigravityHarness",
  harness: createAntigravityHarness,
  install: {
    kind: "script",
    installed: ".local/bin/agy",
    script: (target: string) => antigravityInstall(target),
  },
  image: { variables: antigravityVariables },
  doctor: {
    variables: antigravityVariables,
    diagnostics: antigravityDiagnostics,
  },
  protocol: antigravityProtocolFixtures,
  authentication: [
    {
      value: "account",
      label: "Google account login (agy)",
      instructions:
        "Run agy on the host and sign in with your Google account. Isolated sandboxes receive a private copy of the Antigravity OAuth token.",
    },
    {
      value: "usage",
      label: "Gemini API key (API billing)",
      variable: antigravityCredentialVariables.usage,
      instructions: `Set ${antigravityCredentialVariables.usage} in the workflow .env or parent environment. Gemini API usage is billed separately from Google AI plans.`,
    },
  ],
} as const satisfies AgentDescriptor;
