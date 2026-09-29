import type { AgentObservation } from "../domain/agent.types.ts";
import type { Command } from "../domain/command.types.ts";

export interface CliSteering {
  readonly liveInput: boolean;
  command(command: Command): Command;
  observe(event: AgentObservation): void;
  start(): void;
  close(): void;
}

export interface CliTurnState {
  conversation(): string | undefined;
  completed(): boolean;
  interrupt(): void;
}
