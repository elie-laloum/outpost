import type { AgentObservation, Usage } from "../domain/agent.types.ts";
import type { taskUsageAccounting } from "./task-usage.constants.ts";

export interface TaskUsageCapability {
  readonly [taskUsageAccounting]?: (event: AgentObservation) => void;
}

export interface TaskUsageObserver {
  readonly dispatchOptions: TaskUsageCapability & {
    readonly observe: (event: AgentObservation) => void;
  };
  reconcile(usage: Usage): void;
}
