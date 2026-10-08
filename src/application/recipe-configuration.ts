import { dirname, resolve } from "node:path";
import { builtInAgent, builtInAgentList } from "../adapters/agents/catalog.ts";
import { createAgent } from "../domain/agent.ts";
import type { RecipeConfiguration } from "../application/recipe.types.ts";
import { parseRecipeYaml } from "../infrastructure/recipe.ts";
import {
  configurationObject,
  configurationText,
  configurationAuthentication,
  configurationModel,
  configurationVariable,
  configurationBranch,
} from "./recipe-configuration-values.ts";
import { configurationProvider } from "./recipe-configuration-providers.ts";
import { recipeConfigurationKeys } from "./recipe-configuration.constants.ts";

export async function readRecipeConfiguration(
  source: string,
  file: string,
  resolveEnvironment = true,
): Promise<RecipeConfiguration> {
  const { document } = parseRecipeYaml(source);
  const record = configurationObject(
    document.toJS({ maxAliasCount: 0 }),
    "configuration",
    recipeConfigurationKeys.root,
  );
  if (record.version !== 1)
    throw new Error("Recipe configuration version must be 1");
  if (record.$schema !== undefined)
    configurationText(record.$schema, "configuration.$schema");
  const directory = dirname(resolve(file));
  const repository = resolve(
    directory,
    configurationText(record.repository, "repository"),
  );
  const agents = Object.fromEntries(
    Object.entries(configurationObject(record.agents ?? {}, "agents")).map(
      ([role, value]) => {
        const agent = configurationObject(
          value,
          `agents.${role}`,
          recipeConfigurationKeys.agent,
        );
        const descriptor = builtInAgent(
          configurationText(agent.harness, `agents.${role}.harness`),
        );
        if (!descriptor)
          throw new Error(
            `Unknown recipe harness; choose ${builtInAgentList()}`,
          );
        return [
          role,
          createAgent({
            harness: descriptor.harness({
              authentication: configurationAuthentication(
                agent.authentication,
                directory,
              ),
            }),
            ...(agent.model === undefined
              ? {}
              : { model: configurationModel(agent.model) }),
          }),
        ];
      },
    ),
  );
  const variables = Object.fromEntries(
    Object.entries(
      configurationObject(record.environment ?? {}, "environment"),
    ).map(([name, reference]) => {
      configurationVariable(name);
      const variable = configurationVariable(reference);
      const value = resolveEnvironment ? process.env[variable] : "";
      if (value === undefined)
        throw new Error(`Missing declared environment variable: ${variable}`);
      return [name, value];
    }),
  );
  return {
    sandbox: {
      repository,
      sandboxProvider: await configurationProvider(record.sandbox, variables),
      branch: configurationBranch(record.branch),
      logging: false,
    },
    agents,
  };
}
