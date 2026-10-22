import { realpath } from "node:fs/promises";
import { resolveRecipeConfiguration } from "../recipe-configuration.ts";
import type { RecipeProject } from "./project.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type {
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
import { recipeWorkspaceKey } from "./zones.ts";

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
  const sandboxes: Record<string, SandboxOptions> = {};
  for (const [name, declaration] of Object.entries(model.sandboxes)) {
    const target =
      declaration.workspace === undefined
        ? model.workspace
        : model.workspaces[declaration.workspace];
    invariant(
      target?.kind === "git",
      `Sandbox ${name} requires a Git workspace`,
    );
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
  const preflights = new Map<string, [string, SandboxOptions | undefined]>();
  for (const task of project.document.tasks)
    if (task.agent)
      preflights.set(`${task.agent}\0${task.sandbox ?? ""}`, [
        task.agent,
        task.sandbox === undefined ? undefined : sandboxes[task.sandbox],
      ]);
  for (const [role, zone] of preflights.values())
    await preflightRecipeAgent(
      agents[role]!,
      zone?.repository ?? repository,
      zone?.sandboxProvider?.variables ?? {
        ...provider.variables,
        ...environment,
      },
      scope,
    );

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
