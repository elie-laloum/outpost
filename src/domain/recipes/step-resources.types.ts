import type { RecipeSourcePath } from "./expressions.types.ts";

/** An agent role dispatched by a task in the shared recipe workspace. */
export interface RecipeStepAgent {
  readonly agent: string;
  /** Location of the role name inside its task, such as `["agent"]`. */
  readonly path: RecipeSourcePath;
  /** Whether the task continues this agent's conversation between dispatches. */
  readonly continuation: boolean;
}
