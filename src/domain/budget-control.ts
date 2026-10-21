import { workflowAccounting } from "./workflow/budget.ts";
import type {
  BudgetControl,
  BudgetControlOptions,
} from "./budget-control.types.ts";

export function createBudgetControl(
  options: BudgetControlOptions,
): BudgetControl {
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  const accounting = workflowAccounting(
    options.budget,
    (error) => {
      options.onExhausted(error);
      // Attempt limits close admission while already admitted work may finish.
      if (error.dimension !== "attempts") stop.abort(error);
    },
    options.initialUsage,
  );
  return { stop, signal, accounting };
}
