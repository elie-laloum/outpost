import { antigravityHarness } from "../adapters/agents/antigravity-adapter.ts";
import { antigravityDiagnostics } from "../adapters/agents/antigravity-diagnostics.ts";
import { claudeHarness } from "../adapters/agents/claude-adapter.ts";
import { claudeDiagnostics } from "../adapters/agents/claude-diagnostics.ts";
import { codexHarness } from "../adapters/agents/codex-adapter.ts";
import { codexDiagnostics } from "../adapters/agents/codex-diagnostics.ts";
import { copilotHarness } from "../adapters/agents/copilot-adapter.ts";
import { copilotDiagnostics } from "../adapters/agents/copilot-diagnostics.ts";
import { kimiHarness } from "../adapters/agents/kimi-adapter.ts";
import { kimiDiagnostics } from "../adapters/agents/kimi-diagnostics.ts";
import { agentVersions } from "../providers/versions.constants.ts";
import type { DoctorAgent, DoctorAgentProfile } from "./doctor.types.ts";

export const doctorAgents: Readonly<Record<DoctorAgent, DoctorAgentProfile>> =
  Object.freeze({
    codex: {
      executable: "codex",
      referenceVersion: agentVersions.codex,
      diagnostics: codexDiagnostics,
      harness: () => codexHarness(),
    },
    claude: {
      executable: "claude",
      referenceVersion: agentVersions.claude,
      diagnostics: claudeDiagnostics,
      harness: () => claudeHarness(),
    },
    antigravity: {
      executable: "agy",
      diagnostics: antigravityDiagnostics,
      harness: () => antigravityHarness(),
    },
    copilot: {
      executable: "copilot",
      referenceVersion: agentVersions.copilot,
      diagnostics: copilotDiagnostics,
      harness: () => copilotHarness(),
    },
    kimi: {
      executable: "kimi",
      referenceVersion: agentVersions.kimi,
      diagnostics: kimiDiagnostics,
      harness: () => kimiHarness(),
    },
  });
export const agentDiagnosticDefaults = Object.freeze({ retain: 65_536 });
