import { planRecipeAgents } from "./agent-plan.ts";
import { readRecipeProject } from "./project.ts";
import { recipeTaskZone, recipeWorkspaceKey } from "./zones.ts";
import type {
  RecipeProjectOptions,
  RecipeProjectSources,
} from "./project.types.ts";

export async function inspectRecipeExecution(
  options: RecipeProjectOptions,
  sources?: RecipeProjectSources,
) {
  const project = await readRecipeProject(options, sources);
  const { model } = project;
  return {
    name: project.document.name,
    workspace:
      project.model.workspace.kind === "git"
        ? { kind: "git", repository: project.model.workspace.repository }
        : (project.model.workspace.files.source ?? { kind: "none" }),
    ...(project.files
      ? {
          binding: project.files.plan.binding,
          sandbox: project.files.plan.sandbox,
          agents: planRecipeAgents(project.document, project.graph),
        }
      : {}),
    workspaces: Object.fromEntries(
      Object.entries(model.workspaces).map(([name, workspace]) => [
        name,
        workspace.kind === "git"
          ? { kind: "git", repository: workspace.repository }
          : (workspace.files.source ?? { kind: "none" }),
      ]),
    ),
    sandboxes: Object.fromEntries(
      Object.entries(model.sandboxes).map(([name, sandbox]) => [
        name,
        {
          workspace: recipeWorkspaceKey(sandbox.workspace),
          ...(sandbox.plan?.binding ? { binding: sandbox.plan.binding } : {}),
          ...(sandbox.plan ? { sandbox: sandbox.plan.sandbox } : {}),
        },
      ]),
    ),
    environment: Object.keys(project.model.environment),
    requirements: [...project.graph.nodes.values()].map((node) => ({
      name: node.name,
      kind: node.kind,
      ...(node.definition ? { component: node.definition.name } : {}),
      extension: !!node.extension,
    })),
    outputs: project.files?.outputs ?? [],
    tasks: project.document.tasks.map((task) => {
      const zone = recipeTaskZone(task, model.sandboxes);
      return { key: task.key, after: task.after, ...(zone ? { zone } : {}) };
    }),
    validation: "static",
  };
}
