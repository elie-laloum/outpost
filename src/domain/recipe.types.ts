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
  readonly name: string;
  readonly tasks: readonly RecipeStep[];
}
