import { createRequire } from "node:module";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { recipeObject } from "../../domain/recipes/values.ts";
import type { RecipeExtensionDeclaration } from "../../domain/recipes/component.types.ts";

export function recipeModulePath(module: string, directory: string): string {
  if (/^[a-z]+:/i.test(module) && !isAbsolute(module))
    throw new Error(
      "Recipe extensions require local files or installed packages",
    );
  if (module.startsWith(".") || isAbsolute(module))
    return resolve(directory, module);
  return createRequire(
    pathToFileURL(resolve(directory, "outpost.yaml")),
  ).resolve(module);
}

export async function importRecipeExtension(
  extension: RecipeExtensionDeclaration,
  directory: string,
): Promise<Record<string, unknown>> {
  const module: unknown = await import(
    pathToFileURL(recipeModulePath(extension.module, directory)).href
  );
  if (!recipeObject(module) || !Object.hasOwn(module, extension.export))
    throw new Error(`Missing recipe extension export: ${extension.export}`);
  if (extension.dispose && typeof module[extension.dispose] !== "function")
    throw new Error(`Missing recipe extension disposer: ${extension.dispose}`);
  if (extension.factory && typeof module[extension.export] !== "function")
    throw new Error(`Recipe extension ${extension.export} must be a factory`);
  return module;
}
