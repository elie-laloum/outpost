import { withCleanup } from "../../domain/cleanup.ts";
import { createRecipeComponentScope } from "./scope.ts";
import type { RecipeProject } from "./project.types.ts";

/** Imports every declared extension and checks its export, without allocating a sandbox. */
export async function verifyRecipeExtensions(
  project: RecipeProject,
  signal: AbortSignal,
): Promise<readonly string[]> {
  const scope = createRecipeComponentScope(
    project.graph,
    project.registry,
    project.directory,
    signal,
  );
  await withCleanup(() => scope.prepare(), [() => scope.close()]);
  return [...project.graph.nodes.values()]
    .filter((node) => node.extension)
    .map((node) => node.name);
}
