import type { AgentEvent } from "../../domain/agent.types.ts";

export interface AgentProtocolFixture {
  readonly name: string;
  readonly lines: readonly string[];
  readonly expected: readonly AgentEvent[];
}
