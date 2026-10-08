import type { WorkflowJson } from "./workflow/checkpoint.types.ts";
import type { Command } from "./command.types.ts";
import type { Retry } from "./workflow.types.ts";

export interface RecipeStep {
  readonly when?: WorkflowJson;
  readonly value?: WorkflowJson;
  readonly arguments?: WorkflowJson;
  readonly state?: WorkflowJson;
  readonly options?: Readonly<Record<string, unknown>>;
  readonly call?: Readonly<Record<string, unknown>>;
  readonly loop?: Readonly<Record<string, unknown>>;
  readonly decision?: Readonly<Record<string, unknown>>;
  readonly isolated?: Readonly<Record<string, unknown>>;
  readonly dispatch?: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly after: readonly string[];
  readonly timeoutMs?: number;
  readonly retry?: Retry;
  readonly command?: Command;
  readonly agent?: string;
  readonly brief?: string;
}

export interface RecipeDocument {
  readonly version: 1 | 2 | 3;
  readonly workflow?: Readonly<Record<string, unknown>>;
  readonly name: string;
  readonly description?: string;
  readonly recipeVersion?: string;
  readonly inputs: Readonly<Record<string, RecipeInput>>;
  readonly tasks: readonly RecipeStep[];
}

export type RecipeValue = WorkflowJson;

export interface RecipeInput {
  readonly type: "string" | "number" | "boolean" | "object" | "array" | "null";
  readonly schema?: Readonly<Record<string, unknown>>;
  readonly description: string;
  readonly default?: RecipeValue;
  readonly enum?: readonly RecipeValue[];
}

export interface RecipeReference {
  readonly source: string;
  readonly kind: "inputs" | "steps";
  readonly key: string;
  readonly field?: string;
}
