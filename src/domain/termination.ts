import { findFault } from "./errors.ts";
import type { TerminationCode } from "./termination.types.ts";
import {
  WorkflowBudgetExceeded,
  WorkflowCostUnavailable,
  WorkflowUsageUnavailable,
} from "./workflow/budget.ts";

export function terminationCode(error: unknown): TerminationCode {
  if (error instanceof WorkflowBudgetExceeded) return "limit";
  if (error instanceof WorkflowCostUnavailable) return "usage-unavailable";
  if (error instanceof WorkflowUsageUnavailable) return "usage-unavailable";
  return findFault(error, () => true)?.code ?? "failed";
}
