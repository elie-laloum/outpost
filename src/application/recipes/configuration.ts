import { readRecipeConfiguration } from "../recipe-configuration.ts";
import { recipeConfigurationKeys } from "../recipe-configuration.constants.ts";
import type { RecipeProject } from "./project.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type { RecipeConfiguration } from "../recipe.types.ts";
import type { SandboxProvider } from "../../domain/sandbox.types.ts";
import type { SandboxOptions } from "../outpost.types.ts";
import { nativeRecipeGuards } from "./native.ts";
import { recipeRecord } from "../../domain/recipes/values.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";

function isProvider(value: unknown): value is SandboxProvider {
  return nativeRecipeGuards.sandboxProvider!(value);
}
function isSandboxOptions(value: unknown): value is SandboxOptions {
  return typeof value === "object" && value !== null;
}
function isAgent(value: unknown): value is DispatchAgent {
  return nativeRecipeGuards.agent!(value);
}

export async function recipeExecutionConfiguration(
  project: RecipeProject,
  scope: RecipeComponentScope,
): Promise<RecipeConfiguration> {
  const source = JSON.stringify({
    ...Object.fromEntries(
      Object.entries(project.configuration).filter(([key]) =>
        recipeConfigurationKeys.root.some((allowed) => allowed === key),
      ),
    ),
    version: 1,
    ...(project.configuration.version === 2
      ? { sandbox: { provider: "local" }, agents: {} }
      : {}),
  });
  const legacy = await readRecipeConfiguration(source, project.options.config);
  if (project.configuration.version === 1) return legacy;
  const [provider, options] = await Promise.all([
    scope.resolve("sandbox", "sandboxProvider"),
    scope.resolve("workspace", "sandboxOptions"),
  ]);
  if (!isProvider(provider) || !isSandboxOptions(options))
    throw new Error("Invalid sandbox configuration");
  const environment = legacy.sandbox.sandboxProvider?.variables ?? {};
  scope.protect(Object.values(environment));
  const agents: Record<string, DispatchAgent> = {};
  for (const role of Object.keys(
    recipeRecord(project.configuration.agents ?? {}, "agents"),
  )) {
    const agent = await scope.resolve(`agents.${role}`, "agent");
    if (!isAgent(agent)) throw new Error(`Invalid agent: ${role}`);
    agents[role] = agent;
  }
  return {
    sandbox: {
      ...legacy.sandbox,
      ...options,
      sandboxProvider: {
        ...provider,
        variables: { ...provider.variables, ...environment },
      },
    },
    agents,
  };
}
