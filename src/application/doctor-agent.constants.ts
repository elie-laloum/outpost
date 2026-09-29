import { antigravityVariables } from "../adapters/agents/antigravity/antigravity.constants.ts";
import { createAntigravityHarness } from "../adapters/agents/antigravity/antigravity-adapter.ts";
import { antigravityDiagnostics } from "../adapters/agents/antigravity/antigravity-diagnostics.ts";
import { createClaudeHarness } from "../adapters/agents/claude/claude-adapter.ts";
import { claudeDiagnostics } from "../adapters/agents/claude/claude-diagnostics.ts";
import { createCodexHarness } from "../adapters/agents/codex/codex-adapter.ts";
import { codexDiagnostics } from "../adapters/agents/codex/codex-diagnostics.ts";
import { createCopilotHarness } from "../adapters/agents/copilot/copilot-adapter.ts";
import { copilotDiagnostics } from "../adapters/agents/copilot/copilot-diagnostics.ts";
import { createKimiHarness } from "../adapters/agents/kimi/kimi-adapter.ts";
import { kimiDiagnostics } from "../adapters/agents/kimi/kimi-diagnostics.ts";
import { agentVersions } from "../providers/versions.constants.ts";
import type { DoctorAgent, DoctorAgentProfile } from "./doctor.types.ts";

export const doctorAgents: Readonly<Record<DoctorAgent, DoctorAgentProfile>> =
  Object.freeze({
    codex: {
      executable: "codex",
      referenceVersion: agentVersions.codex,
      diagnostics: codexDiagnostics,
      harness: () => createCodexHarness(),
    },
    claude: {
      executable: "claude",
      referenceVersion: agentVersions.claude,
      diagnostics: claudeDiagnostics,
      harness: () => createClaudeHarness(),
    },
    antigravity: {
      executable: "agy",
      referenceVersion: agentVersions.antigravity,
      variables: antigravityVariables,
      diagnostics: antigravityDiagnostics,
      harness: () => createAntigravityHarness(),
    },
    copilot: {
      executable: "copilot",
      referenceVersion: agentVersions.copilot,
      diagnostics: copilotDiagnostics,
      harness: () => createCopilotHarness(),
    },
    kimi: {
      executable: "kimi",
      referenceVersion: agentVersions.kimi,
      diagnostics: kimiDiagnostics,
      harness: () => createKimiHarness(),
    },
  });
export const agentDiagnosticDefaults = Object.freeze({ retain: 65_536 });
