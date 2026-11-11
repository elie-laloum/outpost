import { validateRecipeExpression } from "../../domain/recipes/expressions.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { resolveRecipeComponent } from "./graph.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeComponentGraph } from "./components.types.ts";

export function validateRecipeProjectExpressions(
  document: RecipeDocument,
  graph: RecipeComponentGraph,
): void {
  for (const step of document.tasks) {
    for (const field of ["isolated", "speculation"]) {
      const node = resolveRecipeComponent(
        graph.nodes,
        `tasks.${step.key}.${field}`,
      );
      if (!node) continue;
      const requests: unknown[] = [];
      if (field === "isolated") requests.push(node.options);
      if (field === "speculation" && Array.isArray(node.options.candidates))
        for (const candidate of node.options.candidates)
          if (recipeObject(candidate)) requests.push(candidate.request);
      for (const request of requests) {
        if (
          !recipeObject(request) ||
          !recipeObject(request.brief) ||
          request.brief.text === undefined
        )
          continue;
        validateRecipeExpression(request.brief.text, { document, step });
      }
    }
  }
}
