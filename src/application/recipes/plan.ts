import { readRecipeProject } from "./project.ts";
import type { RecipeProjectOptions } from "./project.types.ts";

export async function inspectRecipeExecution(options: RecipeProjectOptions) {
  const project = await readRecipeProject(options);
  return {
    name: project.document.name,
    workspace: project.files?.source ?? {
      kind: "git",
      repository: project.legacy.sandbox.repository,
    },
    requirements: [...project.graph.nodes.values()].map((node) => ({
      name: node.name,
      kind: node.kind,
      ...(node.definition ? { component: node.definition.name } : {}),
      extension: !!node.extension,
    })),
    outputs: project.files?.outputs ?? [],
    tasks: project.document.tasks.map((task) => ({
      key: task.key,
      after: task.after,
    })),
    validation: "static",
  };
}
