import type {
  WorkflowBudgetExceeded,
  WorkflowCostUnavailable,
  WorkflowUsageUnavailable,
} from "./workflow/budget.ts";
import type {
  WorkflowAccounting,
  WorkflowBudget,
  WorkflowUsage,
} from "./workflow/budget.types.ts";

export interface BudgetControlOptions {
  readonly signal: AbortSignal | undefined;
  readonly budget: WorkflowBudget | undefined;
  readonly initialUsage: WorkflowUsage | undefined;
  readonly onExhausted: (
    error:
      | WorkflowBudgetExceeded
      | WorkflowUsageUnavailable
      | WorkflowCostUnavailable,
  ) => void;
}

export interface BudgetControl {
  readonly stop: AbortController;
  readonly signal: AbortSignal;
  readonly accounting: WorkflowAccounting;
}
