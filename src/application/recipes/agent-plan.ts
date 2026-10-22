import { builtInAgents } from "../../adapters/agents/catalog.ts";
import { configurationPath } from "../../domain/configuration-diagnostic.ts";
import type { ConfigurationDiagnostic } from "../../domain/configuration-diagnostic.types.ts";
import { fileCapabilityDiagnostics } from "../../domain/file-agent-capabilities.ts";
import { interactiveCaptureRefusal } from "../../domain/file-agent-capabilities.constants.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type {
  RecipeAgentCandidatePlan,
  RecipeAgentPlan,
  RecipeAgentUse,
} from "./agent-plan.types.ts";
import type {
  RecipeComponentGraph,
  RecipeComponentNode,
} from "./components.types.ts";
import { nativeRecipeTypes } from "./native-catalog.constants.ts";

function harnessCandidate(node: RecipeComponentNode): RecipeAgentCandidatePlan {
  const factory = nativeRecipeTypes.find(
    ([name]) => name === node.definition?.name,
  )?.[3];
  const agent = builtInAgents.find(
    (descriptor) => descriptor.harnessExport === factory,
  );
  if (!agent) return { component: node.name };
  return {
    component: node.name,
    harness: agent.name,
    fileWorkspaces: agent.fileWorkspaces,
    continuation:
      "continuation" in agent.fileWorkspaces &&
      agent.fileWorkspaces.continuation &&
      "conversations" in agent &&
      node.options.saveConversations !== false,
  };
}

function candidates(
  graph: RecipeComponentGraph,
  name: string,
  seen: Set<string> = new Set(),
): RecipeAgentCandidatePlan[] {
  const node = graph.nodes.get(name);
  if (!node || seen.has(name)) return [];
  seen.add(name);
  if (node.extension) return [{ component: name }];
  if (node.kind === "harness") return [harnessCandidate(node)];
  return node.dependencies
    .filter((dependency) =>
      ["agent", "harness"].includes(graph.nodes.get(dependency)?.kind ?? ""),
    )
    .flatMap((dependency) => candidates(graph, dependency, seen));
}

/** Agent components used by file recipe tasks, read from the catalog without composing them. */
export function planRecipeAgents(
  document: RecipeDocument,
  graph: RecipeComponentGraph,
): RecipeAgentPlan[] {
  const uses = new Map<string, RecipeAgentUse>();
  const use = (component: string, task: string, interactive: boolean) => {
    const entry = uses.get(component) ?? { tasks: [], requires: new Set() };
    entry.tasks.push(task);
    entry.requires.add("dispatch");
    if (interactive) entry.requires.add("continuation");
    uses.set(component, entry);
  };
  for (const step of document.tasks) {
    if (step.agent) use(`agents.${step.agent}`, step.key, false);
    if (step.interactive && "workspaceSource" in step.interactive)
      for (const dependency of graph.nodes.get(`tasks.${step.key}.interactive`)
        ?.dependencies ?? [])
        if (graph.nodes.get(dependency)?.kind === "agent")
          use(dependency, step.key, true);
  }
  return [...uses].map(([component, { tasks, requires }]) => ({
    component,
    tasks,
    requires: [...requires],
    candidates: candidates(graph, component),
  }));
}

/** Refusals that execution would raise for built-in harnesses, located at the agent component. */
export function recipeAgentDiagnostics(
  plans: readonly RecipeAgentPlan[],
): ConfigurationDiagnostic[] {
  return plans.flatMap((plan) =>
    plan.candidates.flatMap((candidate) => {
      if (!candidate.harness) return [];
      const refusals = fileCapabilityDiagnostics(
        candidate.harness,
        candidate.fileWorkspaces,
        ["dispatch"],
      ).map((diagnostic) => ({
        ...diagnostic,
        path: configurationPath(plan.component),
        hint: "Choose a harness that supports file workspaces, or run the recipe in a Git workspace.",
      }));
      if (plan.requires.includes("continuation") && !candidate.continuation)
        refusals.push({
          code: "unsupported-capability",
          message: interactiveCaptureRefusal,
          path: configurationPath(candidate.component),
          hint: `Use a harness that captures and resumes conversations in file workspaces, and keep saveConversations enabled, for ${plan.tasks.join(", ")}.`,
        });
      return refusals;
    }),
  );
}
