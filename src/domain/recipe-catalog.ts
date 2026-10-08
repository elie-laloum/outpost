import {
  recipeCatalogLimits,
  recipeCatalogFields,
} from "./recipe-catalog.constants.ts";
import type { RecipeCatalog } from "./recipe-catalog.types.ts";

export function validateRecipeCatalog(value: unknown): RecipeCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Recipe catalogue must be a mapping");
  if (
    !("version" in value) ||
    value.version !== 1 ||
    !("recipes" in value) ||
    !Array.isArray(value.recipes) ||
    value.recipes.length > recipeCatalogLimits.entries ||
    Object.keys(value).some((key) => key !== "version" && key !== "recipes")
  )
    throw new Error(
      "Recipe catalogue requires version 1 and at most 1000 recipes",
    );
  const names = new Set<string>();
  const recipes = value.recipes.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Catalogue entries must be mappings");
    const entry = new Map<string, unknown>(Object.entries(value));
    if (
      [...entry.keys()].some(
        (key) => !recipeCatalogFields.some((field) => field === key),
      )
    )
      throw new Error("Unknown catalogue entry field");
    const fields = Object.fromEntries(
      recipeCatalogFields.map((key) => {
        const value = entry.get(key);
        if (typeof value !== "string" || !value.trim())
          throw new Error(`Catalogue entry requires ${key}`);
        return [key, value];
      }),
    );
    const name = fields.name!;
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(name) || names.has(name))
      throw new Error(`Invalid or duplicate catalogue name: ${name}`);
    names.add(name);
    if (!/^[a-f0-9]{64}$/.test(fields.sha256!))
      throw new Error(`Invalid recipe digest: ${name}`);
    return {
      name,
      version: fields.version!,
      description: fields.description!,
      source: fields.source!,
      sha256: fields.sha256!,
    };
  });
  return { version: 1, recipes };
}
