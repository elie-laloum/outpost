import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";

export type AgentCliMode = "start" | "resume" | "fork";
export interface AgentCliScenario {
  readonly mode: AgentCliMode;
  readonly input: AgentInput;
}
export interface AgentCliDiagnostic {
  readonly mode: AgentCliMode;
  readonly command: Command;
  readonly usage: string;
  readonly options: readonly string[];
}
