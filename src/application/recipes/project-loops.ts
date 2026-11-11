import { recipeTaskSourcePath } from "../../domain/recipe.ts";
import {
  declarativeRecipeLoop,
  recipeLoopAgents,
  recipeLoopDispatchComponent,
  recipeLoopDispatchRules,
  validateRecipeLoopDispatch,
  validateRecipeLoopResponse,
} from "../../domain/recipes/loop.ts";
import { recipeObject, recipeReference } from "../../domain/recipes/values.ts";
import { resolveRecipeComponent } from "./graph.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeLoopResponseShape } from "../../domain/recipes/loop.types.ts";
import type {
  RecipeComponentGraph,
  RecipeComponentNode,
} from "./components.types.ts";

/** The declared component behind a chain of references; extensions are only known at runtime. */
function declared(
  graph: RecipeComponentGraph,
  value: unknown,
): RecipeComponentNode | undefined {
  const node = resolveRecipeComponent(
    graph.nodes,
    recipeReference(value) ?? "",
  );
  return node?.definition ? node : undefined;
}

function responseShape(node: RecipeComponentNode): RecipeLoopResponseShape {
  return {
    format: node.definition?.name === "response.text" ? "text" : "json",
    jsonSchema: node.options.jsonSchema,
  };
}

/** Checks loop agents' referenced dispatch options and responses without loading extensions. */
export function validateRecipeProjectLoops(
  document: RecipeDocument,
  graph: RecipeComponentGraph,
): void {
  for (const task of document.tasks) {
    const loop = declarativeRecipeLoop(task);
    if (!loop) continue;
    const loopPath = [...recipeTaskSourcePath(document, task), "loop"];
    for (const use of recipeLoopAgents(loop)) {
      const { dispatch } = use.step;
      const options = dispatch
        ? declared(graph, {
            $ref: recipeLoopDispatchComponent(task.key, use.step),
          })?.options
        : {};
      if (!options) continue;
      if (recipeReference(dispatch))
        validateRecipeLoopDispatch(
          recipeLoopDispatchRules(use),
          options,
          [...loopPath, ...use.step.path, "dispatch"].join("."),
        );
      if (use.phase !== "check") continue;
      if (options.response === undefined) {
        validateRecipeLoopResponse(use.step, undefined, loopPath);
        continue;
      }
      const response = recipeObject(options.response)
        ? declared(graph, options.response)
        : undefined;
      if (response)
        validateRecipeLoopResponse(use.step, responseShape(response), loopPath);
    }
  }
}
