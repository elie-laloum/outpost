import type { recipeComparisons } from "./expressions.constants.ts";
import type { WorkflowJson } from "../workflow/checkpoint.types.ts";
import type { RecipeDocument, RecipeStep } from "../recipe.types.ts";

export interface RecipeExpressionContext {
  readonly inputs: Readonly<Record<string, WorkflowJson>>;
  readonly steps: readonly string[];
  /** Values of the current loop round, such as `round` and `feedback`. */
  readonly loop?: Readonly<Record<string, WorkflowJson>>;
  /** Typed response of the loop check agent whose `done` condition is evaluated. */
  readonly response?: WorkflowJson;
  output(key: string): unknown;
}

export interface RecipeTextReference {
  readonly source: string;
  readonly kind: "inputs" | "steps" | "loop";
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
  /** Loop values this field may interpolate; other fields refuse `{{ loop.* }}`. */
  readonly loop?: readonly string[];
  /** Whether `$response` may read a loop check agent's typed response. */
  readonly response?: boolean;
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

export interface RecipeLoopValue {
  readonly kind: "loop-value";
  readonly name: string;
  readonly sourcePath: RecipeSourcePath;
}

/** `{ $response: [path] }`: a field of a loop check agent's typed response. */
export interface RecipeResponseValue {
  readonly kind: "response-value";
  readonly path: RecipeReferencePath;
  readonly sourcePath: RecipeSourcePath;
}

export interface RecipeExpressionReference {
  readonly reference: RecipeValueReference;
  /** Whether the reference is interpolated into text, which requires a scalar. */
  readonly interpolated: boolean;
}

export interface RecipeTextInterpolation {
  readonly source: string;
  readonly reference: RecipeValueReference | RecipeLoopValue;
}

/** A recipe expression compiled once: references are parsed and located, never reinterpreted. */
export type RecipeExpressionNode =
  | { readonly kind: "literal"; readonly value: WorkflowJson }
  | RecipeValueReference
  | RecipeLoopValue
  | RecipeResponseValue
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
  readonly loop?: readonly string[];
  /** Whether `$response` may read a loop check agent's typed response. */
  readonly response?: boolean;
  /** Prefix of compilation errors, normally the task key. */
  readonly label?: string;
}
