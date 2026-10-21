import type { RecipeDocument } from "../../domain/recipe.types.ts";
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
  evaluate(value: unknown, context: TaskContext): WorkflowJson;
  text(value: string, context: TaskContext): string;
}
