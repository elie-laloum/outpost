import type { Agent } from "../domain/agent.types.ts";
import type { Variables } from "../domain/command.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { SandboxLease, SandboxProvider } from "../domain/sandbox.types.ts";

export interface AgentPreparation {
  readonly agent: Agent;
  readonly lease: SandboxLease;
  readonly placement: SandboxProvider["placement"];
  readonly variables: Variables;
  readonly signal: AbortSignal;
  readonly observation?: ObservationHub;
  /** Credentials already prepared by the caller's warm session. */
  readonly credentials?: Variables;
}

export interface PreparedAgentExecution {
  readonly executionLease: SandboxLease;
  readonly credentials: Variables;
}
