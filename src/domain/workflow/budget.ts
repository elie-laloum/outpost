import type { Usage } from "../agent.types.ts";
import { calculateUsageCost, validatePrices } from "../pricing.ts";
import { addUsage, validateUsage } from "../usage.ts";
import { usageDimensions } from "./budget.constants.ts";
import type {
  WorkflowAccounting,
  WorkflowBudget,
  WorkflowUsage,
} from "./budget.types.ts";

export class WorkflowBudgetExceeded extends Error {
  readonly dimension:
    "attempts" | "cost" | Exclude<keyof Usage, "complete" | "models">;
  readonly limit: number;
  readonly observed: number;
  constructor(
    dimension:
      "attempts" | "cost" | Exclude<keyof Usage, "complete" | "models">,
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

export class WorkflowUsageUnavailable extends Error {
  readonly dimension = "usage";
  constructor() {
    super(
      "Token usage is incomplete; configure budget.attempts and task timeouts or dispatch deadlines before continuing",
    );
    this.name = "WorkflowUsageUnavailable";
  }
}

export class WorkflowCostUnavailable extends Error {
  readonly dimension = "cost";
  constructor() {
    super(
      "Cost is incomplete: every reported token requires a known model and price",
    );
    this.name = "WorkflowCostUnavailable";
  }
}

export function workflowAccounting(
  budget: WorkflowBudget | undefined,
  exhaust: (
    error:
      | WorkflowBudgetExceeded
      | WorkflowUsageUnavailable
      | WorkflowCostUnavailable,
  ) => void,
  initial?: WorkflowUsage,
): WorkflowAccounting {
  budget = budget ? structuredClone(budget) : undefined;
  for (const [key, value] of Object.entries({
    attempts: budget?.attempts,
    ...budget?.usage,
  })) {
    if (value !== undefined && (!Number.isSafeInteger(value) || value < 0))
      throw new Error(
        `Workflow budget ${key} must be a nonnegative safe integer`,
      );
  }
  if (budget?.prices) validatePrices(budget.prices);
  if (
    budget?.cost &&
    (!Number.isFinite(budget.cost.limit) ||
      budget.cost.limit < 0 ||
      !budget.prices ||
      budget.prices.currency !== budget.cost.currency)
  )
    throw new Error(
      "Cost budgets require a finite nonnegative limit and prices in the same currency",
    );
  let attempts = initial?.attempts ?? 0;
  let tokens: Usage = initial
    ? structuredClone(initial.tokens)
    : { input: 0, cached: 0, output: 0 };
  let exhausted = false;
  let usageExhausted = false;
  function fail(
    dimension:
      "attempts" | "cost" | Exclude<keyof Usage, "complete" | "models">,
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
  function checkCompleteness(): WorkflowUsageUnavailable | undefined {
    if (
      tokens.complete !== false ||
      budget?.attempts !== undefined ||
      !usageDimensions.some(
        (dimension) => budget?.usage?.[dimension] !== undefined,
      )
    )
      return;
    const error = new WorkflowUsageUnavailable();
    if (!usageExhausted) {
      exhausted = true;
      usageExhausted = true;
      exhaust(error);
    }
    return error;
  }
  const cost = () =>
    budget?.prices ? calculateUsageCost(tokens, budget.prices) : undefined;
  function checkCost(): Error | undefined {
    if (!budget?.cost) return;
    const current = cost()!;
    if (!current.complete) {
      const error = new WorkflowCostUnavailable();
      if (!usageExhausted) {
        exhausted = true;
        usageExhausted = true;
        exhaust(error);
      }
      return error;
    }
    if (current.amount >= budget.cost.limit)
      return fail("cost", budget.cost.limit, current.amount);
  }
  return {
    get exhausted() {
      return exhausted;
    },
    admit() {
      const unavailable = checkCost() ?? checkCompleteness();
      if (unavailable) throw unavailable;
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
      validateUsage(usage);
      const updated = addUsage(tokens, usage);
      if (budget?.prices) calculateUsageCost(updated, budget.prices);
      tokens = updated;
      checkCost();
      checkCompleteness();
      for (const dimension of usageDimensions) {
        const limit = budget?.usage?.[dimension];
        if (limit !== undefined && (tokens[dimension] ?? 0) >= limit)
          fail(dimension, limit, tokens[dimension] ?? 0);
      }
    },
    snapshot: () =>
      Object.freeze({
        attempts,
        tokens: Object.freeze(structuredClone(tokens)),
        ...(budget?.prices ? { cost: cost()! } : {}),
      }),
  };
}
