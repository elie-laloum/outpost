import { findFault } from "../errors.ts";
import type {
  WorkflowExecutionState,
  WorkflowResult,
  WorkflowTerminationCode,
} from "../workflow.types.ts";
import { WorkflowBudgetExceeded, WorkflowUsageUnavailable } from "./budget.ts";

export function terminationCode(error: unknown): WorkflowTerminationCode {
  if (error instanceof WorkflowBudgetExceeded) return "limit";
  if (error instanceof WorkflowUsageUnavailable) return "usage-unavailable";
  return findFault(error, () => true)?.code ?? "failed";
}

export function workflowOutcome(
  runtime: WorkflowExecutionState,
  deadline: AbortSignal,
): Pick<WorkflowResult, "status" | "terminationCode"> {
  if (runtime.options.signal?.aborted) {
    if (deadline.aborted && runtime.options.signal.reason === deadline.reason)
      return { status: "failed", terminationCode: "timeout" };
    return { status: "cancelled", terminationCode: "aborted" };
  }
  const failures = runtime.errors.filter(
    (error) => terminationCode(error) !== "rejected",
  );
  if (failures.length)
    return { status: "failed", terminationCode: terminationCode(failures[0]) };
  const records = [...runtime.records.values()];
  if (
    runtime.errors.length ||
    records.some((record) => record.status === "rejected")
  )
    return { status: "rejected", terminationCode: "rejected" };
  if (records.some((record) => record.status === "waiting-input"))
    return { status: "waiting-input" };
  if (records.some((record) => record.status === "paused"))
    return { status: "paused" };
  return { status: "done" };
}
