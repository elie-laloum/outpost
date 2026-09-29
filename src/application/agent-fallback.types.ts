import type { Agent, AgentObservation, Usage } from "../domain/agent.types.ts";
import type { FallbackRecord } from "../domain/fallback-agent.types.ts";

export type CandidateRunner<R> = (
  agent: Agent,
  observe: (event: AgentObservation) => void,
) => Promise<R>;

export interface FallbackOutcome<R> {
  readonly value: R;
  /** Usage observed from candidates that failed before the selected one. */
  readonly failedUsage: Usage;
  readonly fallback?: FallbackRecord;
}
