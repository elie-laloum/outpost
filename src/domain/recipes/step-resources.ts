import type { RecipeDocument, RecipeStep } from "../recipe.types.ts";
import type { RecipeStepAgent } from "./step-resources.types.ts";

/** Agent roles a task dispatches in the shared recipe workspace. */
export function recipeStepAgents(step: RecipeStep): readonly RecipeStepAgent[] {
  if (step.agent === undefined) return [];
  return [{ agent: step.agent, path: ["agent"], continuation: false }];
}

/** Whether a task runs commands or agents in the shared recipe workspace. */
export function recipeStepUsesSharedWorkspace(step: RecipeStep): boolean {
  return step.command !== undefined || recipeStepAgents(step).length > 0;
}

/** Distinct agent roles dispatched by the recipe's tasks, in task order. */
export function recipeAgentRoles(document: RecipeDocument): string[] {
  return [
    ...new Set(
      document.tasks.flatMap((step) =>
        recipeStepAgents(step).map((use) => use.agent),
      ),
    ),
  ];
}
