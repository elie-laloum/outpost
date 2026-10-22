import { dirname, resolve } from "node:path";
import type { Variables } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import { recipeRecord } from "../../domain/recipes/values.ts";
import { resolveRecipeConfiguration } from "../recipe-configuration.ts";
import {
  configurationBranch,
  configurationText,
  configurationVariable,
} from "../recipe-configuration-values.ts";
import type {
  RecipeConfigurationModel,
  RecipeConfigurationReader,
  RecipeConfigurationVersion,
  RecipeGitWorkspaceModel,
} from "./configuration-model.types.ts";
import { normalizeRecipeWorkspaceConfiguration } from "./file-configuration.ts";

const readers: Readonly<
  Record<RecipeConfigurationVersion, RecipeConfigurationReader>
> = {
  async 1(record, file) {
    // Version 1 declares its agents and sandbox inline; its resolver remains their validator.
    await resolveRecipeConfiguration(record, file, false);
    return gitModel(1, record, file);
  },
  async 2(record, file) {
    return gitModel(2, record, file);
  },
  async 3(record, file, document) {
    const normalized = normalizeRecipeWorkspaceConfiguration(
      record,
      dirname(resolve(file)),
      document,
    );
    const named = {
      workspaces: normalized.workspaces ?? {},
      sandboxes: normalized.sandboxes ?? {},
      ...(normalized.runtime ? { runtime: normalized.runtime } : {}),
    };
    if (!normalized.files)
      return { ...gitModel(3, normalized.configuration, file), ...named };
    return {
      version: 3,
      components: normalized.configuration,
      workspace: { kind: "files", files: normalized.files },
      ...named,
      environment: declaredEnvironment(record),
      agents: declaredAgents(record),
    };
  },
};

/** Reads a validated configuration document of any version into the shared model. */
export function readRecipeConfigurationModel(
  record: Readonly<Record<string, unknown>>,
  file: string,
  document: RecipeDocument,
): Promise<RecipeConfigurationModel> {
  const version = record.version;
  invariant(
    version === 1 || version === 2 || version === 3,
    "Configuration version must be 1, 2 or 3",
  );
  return readers[version](record, file, document);
}

/** Reads the host variables a configuration declares, failing on any missing one. */
export function resolveRecipeEnvironment(
  environment: RecipeConfigurationModel["environment"],
): Variables {
  return Object.fromEntries(
    Object.entries(environment).map(([name, variable]) => {
      const value = process.env[variable];
      invariant(
        value !== undefined,
        `Missing declared environment variable: ${variable}`,
      );
      return [name, value];
    }),
  );
}

function gitModel(
  version: RecipeConfigurationVersion,
  record: Readonly<Record<string, unknown>>,
  file: string,
): RecipeConfigurationModel {
  if (record.$schema !== undefined)
    configurationText(record.$schema, "configuration.$schema");
  const repository = resolve(
    dirname(resolve(file)),
    configurationText(record.repository, "repository"),
  );
  const environment = declaredEnvironment(record);
  const workspace: RecipeGitWorkspaceModel = {
    kind: "git",
    repository,
    branch: configurationBranch(record.branch),
  };
  return {
    version,
    components: record,
    workspace,
    workspaces: {},
    sandboxes: {},
    environment,
    agents: declaredAgents(record),
  };
}

function declaredEnvironment(
  record: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(recipeRecord(record.environment ?? {}, "environment")).map(
      ([name, reference]) => [
        configurationVariable(name),
        configurationVariable(reference),
      ],
    ),
  );
}

function declaredAgents(
  record: Readonly<Record<string, unknown>>,
): readonly string[] {
  return Object.keys(recipeRecord(record.agents ?? {}, "agents"));
}
