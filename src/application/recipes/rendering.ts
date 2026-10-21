import { recipeValue } from "../../domain/recipe-inputs.ts";
import { renderRecipeText } from "../../domain/recipe-templates.ts";
import { recipeExpression } from "../../domain/recipes/expressions.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeExpressionContext } from "../../domain/recipes/expressions.types.ts";
import type { TaskContext } from "../../domain/workflow.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";

export function recipeTextRenderer(
  version: RecipeDocument["version"],
  contextFor: (context: TaskContext) => RecipeExpressionContext,
): RecipeCompilationContext["text"] {
  switch (version) {
    case 1:
      return (text) => text;
    case 2:
      return (text, context) =>
        renderRecipeText(text, (reference) => {
          const environment = contextFor(context);
          if (reference.kind === "inputs")
            return environment.inputs[reference.key]!;
          const value = environment.output(reference.key);
          const field =
            value && typeof value === "object"
              ? new Map(Object.entries(value)).get(reference.field!)
              : undefined;
          if (!recipeValue(field))
            throw new Error(
              `Missing recipe output: ${reference.key}.${reference.field}`,
            );
          return field;
        });
    case 3:
      return (text, context) => {
        const result = recipeExpression(text, contextFor(context));
        if (typeof result !== "string")
          throw new Error("Recipe text requires a string");
        return result;
      };
  }
}
