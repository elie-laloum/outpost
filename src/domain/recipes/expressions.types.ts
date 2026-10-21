import type { recipeComparisons } from "./expressions.constants.ts";
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

/** Location of a value in its source document, such as `["tasks", 2, "value"]`. */
export type RecipeSourcePath = readonly (string | number)[];

export type RecipeReferencePath = readonly (string | number)[];

export interface RecipeExpressionValidation {
  readonly document: RecipeDocument;
  readonly step: RecipeStep;
  /** Locates validation errors in the recipe document when provided. */
  readonly sourcePath?: RecipeSourcePath;
}

export interface RecipeInputValue {
  readonly kind: "input-value";
  readonly input: string;
  readonly path: RecipeReferencePath;
  readonly sourcePath: RecipeSourcePath;
}

export interface RecipeStepValue {
  readonly kind: "step-value";
  readonly step: string;
  readonly path: RecipeReferencePath;
  readonly sourcePath: RecipeSourcePath;
}

export type RecipeValueReference = RecipeInputValue | RecipeStepValue;

export interface RecipeExpressionReference {
  readonly reference: RecipeValueReference;
  /** Whether the reference is interpolated into text, which requires a scalar. */
  readonly interpolated: boolean;
}

export interface RecipeTextInterpolation {
  readonly source: string;
  readonly reference: RecipeValueReference;
}

/** A recipe expression compiled once: references are parsed and located, never reinterpreted. */
export type RecipeExpressionNode =
  | { readonly kind: "literal"; readonly value: WorkflowJson }
  | RecipeValueReference
  | {
      readonly kind: "select";
      readonly from: RecipeExpressionNode;
      readonly path: RecipeReferencePath;
      readonly sourcePath: RecipeSourcePath;
    }
  | {
      readonly kind: "text";
      readonly text: string;
      readonly interpolations: readonly RecipeTextInterpolation[];
      readonly sourcePath: RecipeSourcePath;
    }
  | { readonly kind: "array"; readonly items: readonly RecipeExpressionNode[] }
  | {
      readonly kind: "object";
      readonly entries: readonly (readonly [string, RecipeExpressionNode])[];
    };

export type RecipeComparison = (typeof recipeComparisons)[number];

export type RecipeConditionNode =
  | { readonly kind: "constant"; readonly value: boolean }
  | {
      readonly kind: "all" | "any";
      readonly items: readonly RecipeConditionNode[];
    }
  | { readonly kind: "not"; readonly item: RecipeConditionNode }
  | { readonly kind: "exists"; readonly expression: RecipeExpressionNode }
  | {
      readonly kind: "compare";
      readonly operator: RecipeComparison;
      readonly left: RecipeExpressionNode;
      readonly right: RecipeExpressionNode;
    };

export interface RecipeExpressionScope {
  readonly inputs: readonly string[];
  readonly steps: readonly string[];
  /** Prefix of compilation errors, normally the task key. */
  readonly label?: string;
}
