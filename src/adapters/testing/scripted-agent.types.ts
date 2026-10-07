import type { AgentEvent, Usage } from "../../domain/agent.types.ts";

export interface ScriptedCommit {
  readonly message: string;
  readonly files: Readonly<Record<string, string | null>>;
}

export interface ScriptedTurn {
  readonly text?: string;
  readonly events?: readonly AgentEvent[];
  readonly usage?: Usage;
  readonly commit?: ScriptedCommit;
  readonly status?: number;
  readonly stderr?: string;
}

export interface ScriptedAgentOptions {
  readonly name?: string;
  readonly turns: readonly ScriptedTurn[];
}
