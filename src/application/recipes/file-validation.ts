import { invariant } from "../../domain/errors.ts";
import { builtInAgents } from "../../adapters/agents/catalog.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeComponentGraph } from "./components.types.ts";

export function validateFileRecipeCapabilities(
  document: RecipeDocument,
  graph: RecipeComponentGraph,
): void {
  const visited = new Set<string>();
  const visit = (name: string) => {
    if (visited.has(name)) return;
    visited.add(name);
    const node = graph.nodes.get(name);
    if (!node) return;
    const factory = node.definition?.name;
    invariant(
      !builtInAgents.some((agent) => factory === `harness.${agent.name}`),
      "Native CLI support for file workspaces has not been validated",
    );
    invariant(
      factory !== "toolset.git" &&
        !(factory === "tool.custom" && node.options.workspace === "git"),
      "Git tools cannot run in file workspaces",
    );
    if (factory === "toolset.files" || factory === "toolset.search")
      invariant(
        node.options.selection === "filesystem",
        "File recipes require explicit filesystem tool selection",
      );
    for (const dependency of node.dependencies) visit(dependency);
  };
  for (const step of document.tasks) {
    if (step.agent) visit(`agents.${step.agent}`);
    if (step.dispatch) visit(`tasks.${step.key}.dispatch`);
    if (step.isolated) visit(`tasks.${step.key}.isolated`);
    if (step.interactive) visit(`tasks.${step.key}.interactive`);
  }
}
