import { recipeEditorFeatures } from "../../domain/recipes/editor-scene.constants.ts";
import { recipeFamilies } from "../../domain/recipes/schema.constants.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { recipeProjectRegistry } from "../recipes/project.ts";
import type { RecipeRegistry } from "../../domain/recipes/component.types.ts";
import type {
  RecipeEditorCompatibility,
  RecipeEditorFeature,
} from "../../domain/recipes/editor-scene.types.ts";

function types(registry: RecipeRegistry, kind: string): string[] {
  return registry.components
    .filter((definition) => definition.kind === kind)
    .map((definition) => definition.name.slice(kind.length + 1));
}

/** Reads which sandbox features each provider schema declares, and the types of each family. */
export function recipeEditorCompatibility(
  extra?: RecipeRegistry,
): RecipeEditorCompatibility {
  const registry = recipeProjectRegistry(extra);
  const features = Object.entries(recipeEditorFeatures).flatMap(
    ([name, declaration]) =>
      declaration.zone === "sandbox" ? [name as RecipeEditorFeature] : [],
  );
  const providers = registry.components
    .filter((definition) => definition.kind === "sandboxProvider")
    .map((definition) => {
      const properties = recipeObject(definition.schema.properties)
        ? definition.schema.properties
        : {};
      return [
        definition.name.slice("sandboxProvider.".length),
        features.filter((feature) => Object.hasOwn(properties, feature)),
      ] as const;
    });
  return {
    providers: Object.fromEntries(providers),
    families: Object.fromEntries(
      Object.entries(recipeFamilies).map(([family, kind]) => [
        family,
        { kind, types: types(registry, kind) },
      ]),
    ),
  };
}
