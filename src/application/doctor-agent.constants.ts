import { claudeDiagnostics } from "../adapters/agents/claude-diagnostics.ts";
import { codexDiagnostics } from "../adapters/agents/codex-diagnostics.ts";

export const agentDiagnosticPlans = {
  claude: claudeDiagnostics,
  codex: codexDiagnostics,
} as const;
export const agentDiagnosticDefaults = Object.freeze({ retain: 65_536 });
