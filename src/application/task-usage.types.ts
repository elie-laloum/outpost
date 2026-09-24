import type { AgentObservation, Usage } from "../domain/agent.types.ts";
export interface TaskUsageObserver {
  observe(event: AgentObservation): void;
  reconcile(usage: Usage): void;
}
