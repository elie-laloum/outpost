import {
  configurationInvariant,
  ConfigurationError,
} from "../../domain/configuration-diagnostic.ts";
import { planRecipeAgents, recipeAgentDiagnostics } from "./agent-plan.ts";
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
    configurationInvariant(
      factory !== "toolset.git" &&
        !(factory === "tool.custom" && node.options.workspace === "git"),
      "Git tools cannot run in file workspaces",
      name,
      "git-workspace-only",
      "Use toolset files or search with selection: filesystem, or run the recipe in a Git workspace.",
    );
    if (factory === "toolset.files" || factory === "toolset.search")
      configurationInvariant(
        node.options.selection === "filesystem",
        "File recipes require explicit filesystem tool selection",
        `${name}.selection`,
        "missing-field",
        "Set selection: filesystem on this toolset.",
      );
    for (const dependency of node.dependencies) visit(dependency);
  };
  for (const step of document.tasks) {
    if (step.agent) visit(`agents.${step.agent}`);
    if (step.dispatch) visit(`tasks.${step.key}.dispatch`);
    if (step.isolated) visit(`tasks.${step.key}.isolated`);
    if (step.interactive) visit(`tasks.${step.key}.interactive`);
  }
  const [diagnostic] = recipeAgentDiagnostics(
    planRecipeAgents(document, graph),
  );
  if (diagnostic) throw new ConfigurationError(diagnostic);
}
