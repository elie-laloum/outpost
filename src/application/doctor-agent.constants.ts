import { claudeDiagnostics } from "../adapters/agents/claude-diagnostics.ts";
import { codexDiagnostics } from "../adapters/agents/codex-diagnostics.ts";
import { geminiDiagnostics } from "../adapters/agents/gemini-diagnostics.ts";

export const agentDiagnosticPlans = {
  gemini: geminiDiagnostics,
  claude: claudeDiagnostics,
  codex: codexDiagnostics,
} as const;
export const agentDiagnosticDefaults = Object.freeze({ retain: 65_536 });
