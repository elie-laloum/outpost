import { realpath } from "node:fs/promises";
import { resolveRecipeConfiguration } from "../recipe-configuration.ts";
import type { RecipeProject } from "./project.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type {
  RecipeGitZoneOptions,
  RecipeRuntimeConfiguration,
  RecipeIntegrationSettings,
} from "./advanced-components.types.ts";
import type { SandboxProvider } from "../../domain/sandbox.types.ts";
import type { SandboxOptions } from "../outpost.types.ts";
import { nativeRecipeGuards } from "./native.ts";
import { invariant } from "../../domain/errors.ts";
import { resolveRecipeEnvironment } from "./configuration-model.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import { preflightRecipeAgent } from "./agent-preflight.ts";
import { recipeTaskKind, recipeWorkspaceKey } from "./zones.ts";

function isProvider(value: unknown): value is SandboxProvider {
  return nativeRecipeGuards.sandboxProvider!(value);
}
function isSandboxOptions(value: unknown): value is SandboxOptions {
  return typeof value === "object" && value !== null;
}
function isAgent(value: unknown): value is DispatchAgent {
  return nativeRecipeGuards.agent!(value);
}

function isIntegration(value: unknown): value is RecipeIntegrationSettings {
  return typeof value === "object" && value !== null;
}

/** Options of the named sandboxes that open a Git workspace; file sandboxes have their own. */
async function gitSandboxes(
  project: RecipeProject,
  scope: RecipeComponentScope,
  environment: Readonly<Record<string, string>>,
): Promise<Record<string, SandboxOptions>> {
  const { model } = project;
  const sandboxes: Record<string, SandboxOptions> = {};
  for (const [name, declaration] of Object.entries(model.sandboxes)) {
    const target =
      declaration.workspace === undefined
        ? model.workspace
        : model.workspaces[declaration.workspace];
    if (target?.kind !== "git") continue;
    const [named, settings] = await Promise.all([
      scope.resolve(`sandboxes.${name}`, "sandboxProvider"),
      scope.resolve(
        recipeWorkspaceKey(declaration.workspace),
        "sandboxOptions",
      ),
    ]);
    if (!isProvider(named) || !isSandboxOptions(settings))
      throw new Error(`Invalid sandbox configuration: ${name}`);
    sandboxes[name] = {
      repository: target.repository,
      branch: target.branch,
      logging: false,
      ...settings,
      sandboxProvider: {
        ...named,
        variables: { ...named.variables, ...environment },
      },
    };
  }
  return sandboxes;
}

/** Resolves the variables of each agent task that runs in a Git zone before anything opens. */
async function preflightGitAgents(
  project: RecipeProject,
  scope: RecipeComponentScope,
  agents: Readonly<Record<string, DispatchAgent>>,
  sandboxes: Readonly<Record<string, SandboxOptions>>,
  main?: readonly [string, Readonly<Record<string, string>>],
): Promise<void> {
  const preflights = new Map<
    string,
    readonly [string, string, Readonly<Record<string, string>>]
  >();
  for (const task of project.document.tasks) {
    if (!task.agent || recipeTaskKind(project.model, task) !== "git") continue;
    const zone =
      task.sandbox === undefined ? undefined : sandboxes[task.sandbox];
    const repository = zone?.repository ?? main?.[0];
    const variables = zone?.sandboxProvider?.variables ?? main?.[1];
    if (repository && variables)
      preflights.set(`${task.agent}\0${task.sandbox ?? ""}`, [
        task.agent,
        repository,
        variables,
      ]);
  }
  for (const [role, repository, variables] of preflights.values())
    await preflightRecipeAgent(agents[role]!, repository, variables, scope);
}

/** Git sandboxes and integration of a file configuration that also declares Git workspaces. */
export async function recipeGitZoneOptions(
  project: RecipeProject,
  scope: RecipeComponentScope,
  agents: Readonly<Record<string, DispatchAgent>>,
): Promise<RecipeGitZoneOptions> {
  const environment = resolveRecipeEnvironment(project.model.environment);
  const sandboxes = await gitSandboxes(project, scope, environment);
  if (!Object.keys(sandboxes).length) return {};
  const integration = await scope.resolve("integration", "integrationOptions");
  if (!isIntegration(integration))
    throw new Error("Invalid integration options");
  await preflightGitAgents(project, scope, agents, sandboxes);
  return { integration, sandboxes };
}

export async function recipeExecutionConfiguration(
  project: RecipeProject,
  scope: RecipeComponentScope,
): Promise<RecipeRuntimeConfiguration> {
  const { model } = project;
  if (model.version === 1)
    return resolveRecipeConfiguration(
      project.configuration,
      project.options.config,
    );
  invariant(
    model.workspace.kind === "git",
    "File recipe configurations run through file workspaces",
  );
  const { repository, branch } = model.workspace;
  const environment = resolveRecipeEnvironment(model.environment);
  const [provider, options] = await Promise.all([
    scope.resolve("sandbox", "sandboxProvider"),
    scope.resolve("workspace", "sandboxOptions"),
  ]);
  if (!isProvider(provider) || !isSandboxOptions(options))
    throw new Error("Invalid sandbox configuration");
  const integration = await scope.resolve("integration", "integrationOptions");
  if (!isIntegration(integration))
    throw new Error("Invalid integration options");
  scope.protect(Object.values(environment));
  const agents: Record<string, DispatchAgent> = {};
  for (const role of model.agents) {
    const agent = await scope.resolve(`agents.${role}`, "agent");
    if (!isAgent(agent)) throw new Error(`Invalid agent: ${role}`);
    agents[role] = agent;
  }
  const sandboxes = await gitSandboxes(project, scope, environment);
  await preflightGitAgents(project, scope, agents, sandboxes, [
    repository,
    { ...provider.variables, ...environment },
  ]);

  if (options.workspace) {
    if (model.components.branch !== undefined)
      throw new Error(
        "A borrowed workspace owns its branch policy; omit configuration.branch",
      );
    for (const key of ["guard", "copies", "storageQuota"] as const)
      if (options[key] !== undefined)
        throw new Error(`A borrowed workspace cannot declare workspace.${key}`);
    if (
      (await realpath(options.workspace.repository)) !==
      (await realpath(repository))
    )
      throw new Error(
        "Borrowed workspace repository does not match configuration.repository",
      );
  }
  return {
    sandbox: {
      ...(options.workspace ? {} : { repository, branch }),
      logging: false,
      ...options,
      sandboxProvider: {
        ...provider,
        variables: { ...provider.variables, ...environment },
      },
    },
    agents,
    integration,
    ...(Object.keys(sandboxes).length ? { sandboxes } : {}),
  };
}
