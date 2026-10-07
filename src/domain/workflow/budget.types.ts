import type { ModelPriceTable, UsageCost } from "../pricing.types.ts";
import type { Usage } from "../agent.types.ts";

export interface WorkflowBudget {
  readonly prices?: ModelPriceTable;
  readonly cost?: { readonly currency: "EUR" | "USD"; readonly limit: number };
  readonly attempts?: number;
  readonly usage?: Partial<Omit<Usage, "complete" | "models">>;
}

export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
  readonly cost?: UsageCost;
}

export interface WorkflowAccounting {
  readonly exhausted: boolean;
  admit(): void;
  report(usage: Usage): void;
  snapshot(): WorkflowUsage;
}
