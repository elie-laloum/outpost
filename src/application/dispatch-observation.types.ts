import type { Usage } from "../domain/agent.types.ts";

export interface ObservedDispatchResult {
  readonly usage: Usage;
  readonly completed: boolean;
}
