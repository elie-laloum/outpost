import type { WorkflowJson } from "../workflow/checkpoint.types.ts";
import type { RecipeDocument, RecipeStep } from "../recipe.types.ts";

export interface RecipeExpressionContext {
  readonly inputs: Readonly<Record<string, WorkflowJson>>;
  readonly steps: readonly string[];
  output(key: string): unknown;
}

export interface RecipeTextReference {
  readonly source: string;
  readonly kind: "inputs" | "steps";
  readonly key: string;
  readonly path: readonly string[];
}

export interface RecipeExpressionValidation {
  readonly document: RecipeDocument;
  readonly step: RecipeStep;
}
