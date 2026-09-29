import type { AgentDescriptor } from "../agent-descriptor.types.ts";
import { createKimiHarness } from "./kimi-adapter.ts";
import { kimiCredentialVariables, kimiLabel } from "./kimi.constants.ts";
import { kimiDiagnostics } from "./kimi-diagnostics.ts";
import { kimiProtocolFixtures } from "./kimi-protocol.constants.ts";

export const kimiAgent = {
  name: "kimi",
  label: kimiLabel,
  executable: "kimi",
  version: "2.1.1",
  harnessExport: "createKimiHarness",
  harness: createKimiHarness,
  install: { kind: "npm", package: "@moonshot-ai/kimi-code" },
  doctor: { diagnostics: kimiDiagnostics },
  protocol: kimiProtocolFixtures,
  authentication: [
    {
      value: "account",
      label: "Kimi Code account login",
      instructions:
        "Sign in with the kimi CLI on the host. Isolated sandboxes receive a private copy of the ~/.kimi-code credentials and device identifier.",
    },
    {
      value: "usage",
      label: "Kimi API key (API billing, requires --model)",
      variable: kimiCredentialVariables.usage,
      instructions: `Set ${kimiCredentialVariables.usage} in the workflow .env or parent environment. API usage is billed separately from Kimi Code plans.`,
    },
  ],
} as const satisfies AgentDescriptor;
