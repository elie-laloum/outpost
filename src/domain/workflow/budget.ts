import type { Usage } from "../agent.types.ts";
import { addUsage } from "../usage.ts";
import { usageDimensions } from "./budget.constants.ts";
import type { WorkflowAccounting, WorkflowBudget } from "./budget.types.ts";

export class WorkflowBudgetExceeded extends Error {
  readonly dimension: "attempts" | keyof Usage;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  ) {
    super(
      `Workflow budget exhausted: ${dimension} limit ${limit}, observed ${observed}`,
    );
    this.name = "WorkflowBudgetExceeded";
    this.dimension = dimension;
    this.limit = limit;
    this.observed = observed;
  }
}

export function workflowAccounting(
  budget: WorkflowBudget | undefined,
  exhaust: (error: WorkflowBudgetExceeded) => void,
): WorkflowAccounting {
  for (const [key, value] of Object.entries({
    attempts: budget?.attempts,
    ...budget?.usage,
  })) {
    if (value !== undefined && (!Number.isSafeInteger(value) || value < 0))
      throw new Error(
        `Workflow budget ${key} must be a nonnegative safe integer`,
      );
  }
  let attempts = 0;
  let tokens: Usage = { input: 0, cached: 0, output: 0 };
  let exhausted = false;
  let usageExhausted = false;
  function fail(
    dimension: "attempts" | keyof Usage,
    limit: number,
    observed: number,
  ): WorkflowBudgetExceeded {
    const error = new WorkflowBudgetExceeded(dimension, limit, observed);
    if (!exhausted || (dimension !== "attempts" && !usageExhausted)) {
      exhausted = true;
      if (dimension !== "attempts") usageExhausted = true;
      exhaust(error);
    }
    return error;
  }
  return {
    get exhausted() {
      return exhausted;
    },
    admit() {
      if (budget?.attempts !== undefined && attempts >= budget.attempts)
        throw fail("attempts", budget.attempts, attempts);
      for (const dimension of usageDimensions) {
        const limit = budget?.usage?.[dimension];
        if (limit !== undefined && (tokens[dimension] ?? 0) >= limit)
          throw fail(dimension, limit, tokens[dimension] ?? 0);
      }
      attempts++;
    },
    report(usage) {
      for (const dimension of usageDimensions) {
        const value = usage[dimension] ?? 0;
        if (!Number.isSafeInteger(value) || value < 0)
          throw new Error(
            `Reported usage ${dimension} must be a nonnegative safe integer`,
          );
      }
      tokens = addUsage(tokens, usage);
      for (const dimension of usageDimensions) {
        const limit = budget?.usage?.[dimension];
        if (limit !== undefined && (tokens[dimension] ?? 0) >= limit)
          fail(dimension, limit, tokens[dimension] ?? 0);
      }
    },
    snapshot: () =>
      Object.freeze({ attempts, tokens: Object.freeze({ ...tokens }) }),
  };
}
