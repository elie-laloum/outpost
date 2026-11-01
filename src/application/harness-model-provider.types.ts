import type { CustomAgent } from "../domain/agent.types.ts";
import type { ModelResult } from "../domain/model.types.ts";
import type { HarnessBudget } from "./harness-budget.types.ts";

export interface HarnessModelScope {
  readonly agent: CustomAgent;
  readonly trackModels?: boolean;
  readonly signal: AbortSignal;
  readonly budget: HarnessBudget;
  track<T>(operation: Promise<T>): Promise<T>;
  account(result: ModelResult, subagentId?: string): void;
}
