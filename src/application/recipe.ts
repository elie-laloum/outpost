import { bindRecipeWorkflow } from "./recipes/workflow.ts";
import { parseRecipe } from "../infrastructure/recipe.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import type { Workflow } from "../domain/workflow.types.ts";
import type { MixedRecipeBindings } from "./recipe.types.ts";
import type { RecipeDispatchSettings } from "./recipes/agent-components.types.ts";

export function defineRecipe(
  source: string,
  bindings: MixedRecipeBindings,
): Workflow {
  return bindRecipe(parseRecipe(source), bindings);
}

export function bindRecipe(
  document: RecipeDocument,
  bindings: MixedRecipeBindings,
  requests: Readonly<Record<string, RecipeDispatchSettings>> = {},
): Workflow {
  if (
    document.version === 3 &&
    (document.workflow || document.tasks.some((step) => step.options))
  )
    throw new Error(
      "Recipe workflow and task options require createRecipeRuntime",
    );
  return bindRecipeWorkflow(document, bindings, {
    workflow: {},
    steps: Object.fromEntries(
      Object.entries(requests).map(([key, dispatch]) => [key, { dispatch }]),
    ),
  });
}
