import type { Usage } from "../domain/agent.types.ts";

export interface ObservedDispatchResult {
  readonly branch?: string;
  readonly commits?: readonly import("../domain/workspace.types.ts").Commit[];
  readonly usage: Usage;
  readonly completed: boolean;
}
