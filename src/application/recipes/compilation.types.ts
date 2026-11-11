import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type {
  RecipeConditionNode,
  RecipeExpressionContext,
} from "../../domain/recipes/expressions.types.ts";
import type {
  Task,
  TaskContext,
  TaskOptions,
} from "../../domain/workflow.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { FileSandbox } from "../file-sandbox.types.ts";
import type { Sandbox } from "../outpost.types.ts";
import type {
  RecipeExecutionBindings,
  RecipeWorkflowComponents,
} from "./workflow-components.types.ts";

export interface RecipeCompilationContext {
  readonly version: RecipeDocument["version"];
  readonly common: Omit<TaskOptions<unknown>, "perform" | "after"> & {
    readonly after: readonly Task[];
  };
  readonly bindings: RecipeExecutionBindings;
  readonly components: RecipeWorkflowComponents;
  sandbox(context: TaskContext): Promise<Sandbox | FileSandbox>;
  evaluate(
    value: unknown,
    context: TaskContext,
    loop?: RecipeExpressionContext["loop"],
  ): WorkflowJson;
  /** Renders recipe text; `loop` supplies the round values of a loop field. */
  text(
    value: string,
    context: TaskContext,
    loop?: RecipeExpressionContext["loop"],
  ): string;
  /** Evaluates a compiled condition; `response` is a loop check agent's typed response. */
  condition(
    node: RecipeConditionNode,
    context: TaskContext,
    response?: WorkflowJson,
  ): boolean;
}
