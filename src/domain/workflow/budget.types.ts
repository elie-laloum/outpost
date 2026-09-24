import type { Usage } from "../agent.types.ts";

export interface WorkflowBudget {
  readonly attempts?: number;
  readonly usage?: Partial<Usage>;
}

export interface WorkflowUsage {
  readonly attempts: number;
  readonly tokens: Usage;
}

export interface WorkflowAccounting {
  readonly exhausted: boolean;
  admit(): void;
  report(usage: Usage): void;
  snapshot(): WorkflowUsage;
}
