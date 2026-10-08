import type { Command } from "./command.types.ts";
import type { Retry } from "./workflow.types.ts";

export interface RecipeStep {
  readonly key: string;
  readonly after: readonly string[];
  readonly timeoutMs?: number;
  readonly retry?: Retry;
  readonly command?: Command;
  readonly agent?: string;
  readonly brief?: string;
}

export interface RecipeDocument {
  readonly version: 1 | 2;
  readonly name: string;
  readonly description?: string;
  readonly recipeVersion?: string;
  readonly inputs: Readonly<Record<string, RecipeInput>>;
  readonly tasks: readonly RecipeStep[];
}

export type RecipeValue = string | number | boolean;

export interface RecipeInput {
  readonly type: "string" | "number" | "boolean";
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
