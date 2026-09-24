import type { AgentCliScenario } from "./cli-diagnostics.types.ts";

export const cliDiagnosticScenarios: readonly AgentCliScenario[] = [
  { mode: "start", input: {} },
  {
    mode: "resume",
    input: { continuation: { id: "00000000-0000-0000-0000-000000000000" } },
  },
  {
    mode: "fork",
    input: {
      continuation: { id: "00000000-0000-0000-0000-000000000000", fork: true },
    },
  },
];
export const codexDiagnosticUsage = {
  start: "codex exec",
  resume: "codex exec resume",
  fork: "codex exec fork",
} as const;
export const claudeDiagnosticUsage = {
  start: "claude",
  resume: "claude",
  fork: "claude",
} as const;
