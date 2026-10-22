import { configurationInvariant } from "../../domain/configuration-diagnostic.ts";
import { recipeTaskSourcePath } from "../../domain/recipe.ts";
import type { RecipeDocument, RecipeStep } from "../../domain/recipe.types.ts";
import type { RecipeConfigurationModel } from "./configuration-model.types.ts";
import type { RecipeRuntimeConfiguration } from "./advanced-components.types.ts";
import type { SandboxOptions } from "../outpost.types.ts";
import type { RecipeTaskZone } from "./zones.types.ts";

/** Configuration key of a named workspace, or of the configuration workspace. */
export function recipeWorkspaceKey(name: string | undefined): string {
  return name === undefined ? "workspace" : `workspaces.${name}`;
}

/** Checkpoint resource of a workspace key; the configuration workspace keeps its historical name. */
export function recipeZoneResource(workspace: string): string {
  return workspace === "workspace" ? "shared" : workspace;
}

/** Workspace key recorded by a zone checkpoint resource. */
export function recipeZoneWorkspace(resource: string): string {
  return resource === "shared" ? "workspace" : resource;
}

/** Zone of a command or agent task; other tasks borrow no shared sandbox. */
export function recipeTaskZone(
  step: RecipeStep,
  sandboxes: RecipeConfigurationModel["sandboxes"],
): RecipeTaskZone | undefined {
  if (!step.command && !step.agent) return;
  return recipeSandboxZone(step.sandbox, sandboxes);
}

/** Zone of a named sandbox, or of the configuration sandbox when `name` is absent. */
export function recipeSandboxZone(
  name: string | undefined,
  sandboxes: RecipeConfigurationModel["sandboxes"],
): RecipeTaskZone {
  if (name === undefined) return { workspace: "workspace", sandbox: "sandbox" };
  return {
    workspace: recipeWorkspaceKey(sandboxes[name]?.workspace),
    sandbox: `sandboxes.${name}`,
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

/** Options of the configuration sandbox a zone names. */
export function recipeZoneOptions(
  configuration: RecipeRuntimeConfiguration,
  zone: RecipeTaskZone,
): SandboxOptions {
  if (zone.sandbox === "sandbox") return configuration.sandbox;
  const options =
    configuration.sandboxes?.[zone.sandbox.slice("sandboxes.".length)];
  if (!options) throw new Error(`Unknown recipe sandbox: ${zone.sandbox}`);
  return options;
}

/** Opened workspaces with the configuration workspace first, then by name. */
export function recipeZoneOrder<T>(
  workspaces: ReadonlyMap<string, T>,
): [string, T][] {
  const rank = (key: string) => (key === "workspace" ? "" : key);
  return [...workspaces].sort(([left], [right]) =>
    rank(left) < rank(right) ? -1 : 1,
  );
}

/** Options that open a workspace key, read from a sandbox that names it. */
export function recipeWorkspaceOptions(
  configuration: RecipeRuntimeConfiguration,
  sandboxes: RecipeConfigurationModel["sandboxes"],
  workspace: string,
): SandboxOptions | undefined {
  if (workspace === "workspace") return configuration.sandbox;
  const name = Object.keys(sandboxes).find(
    (sandbox) => recipeSandboxZone(sandbox, sandboxes).workspace === workspace,
  );
  return name === undefined ? undefined : configuration.sandboxes?.[name];
}
