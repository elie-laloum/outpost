import { configurationInvariant } from "../../domain/configuration-diagnostic.ts";
import { recipeTaskSourcePath } from "../../domain/recipe.ts";
import type { RecipeDocument, RecipeStep } from "../../domain/recipe.types.ts";
import type { RecipeConfigurationModel } from "./configuration-model.types.ts";
import type { RecipeTaskZone } from "./zones.types.ts";

/** Configuration key of a named workspace, or of the configuration workspace. */
export function recipeWorkspaceKey(name: string | undefined): string {
  return name === undefined ? "workspace" : `workspaces.${name}`;
}

/** Zone of a command or agent task; other tasks borrow no shared sandbox. */
export function recipeTaskZone(
  step: RecipeStep,
  sandboxes: RecipeConfigurationModel["sandboxes"],
): RecipeTaskZone | undefined {
  if (!step.command && !step.agent) return;
  if (step.sandbox === undefined)
    return { workspace: "workspace", sandbox: "sandbox" };
  return {
    workspace: recipeWorkspaceKey(sandboxes[step.sandbox]?.workspace),
    sandbox: `sandboxes.${step.sandbox}`,
  };
}

/** Workspace key used to order shared tasks; tasks without a zone share none. */
export function recipeTaskWorkspace(
  sandboxes: RecipeConfigurationModel["sandboxes"],
): (step: RecipeStep) => string {
  return (step) => recipeTaskZone(step, sandboxes)?.workspace ?? "";
}

export function validateRecipeZones(
  document: RecipeDocument,
  model: RecipeConfigurationModel,
): void {
  for (const step of document.tasks)
    configurationInvariant(
      step.sandbox === undefined ||
        Object.hasOwn(model.sandboxes, step.sandbox),
      `Unknown recipe sandbox: ${step.sandbox}`,
      [...recipeTaskSourcePath(document, step), "sandbox"],
      "unknown-reference",
      `Declare sandboxes.${step.sandbox} in the execution configuration.`,
    );
}
