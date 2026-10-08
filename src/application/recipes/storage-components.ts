import { defineJsonArtifact } from "../../domain/artifact.ts";
import { recipeJsonValidator } from "../../infrastructure/recipes/schema.ts";
import type { RecipeJsonArtifactOptions } from "./storage-components.types.ts";

export function defineRecipeJsonArtifact(options: RecipeJsonArtifactOptions) {
  return defineJsonArtifact({
    name: options.name,
    version: options.version,
    schema: options.schema ?? recipeJsonValidator(options.jsonSchema),
  });
}
