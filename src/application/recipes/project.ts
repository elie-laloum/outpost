import { recipeFileError } from "../../infrastructure/recipes/diagnostic.ts";
import { dirname, resolve } from "node:path";
import { parseRecipe, parseRecipeYaml } from "../../infrastructure/recipe.ts";
import { readRecipeFile } from "../../infrastructure/recipes/read.ts";
import { recipeFamilies } from "../../domain/recipes/schema.constants.ts";
import { recipeRecord } from "../../domain/recipes/values.ts";
import { createRecipeRegistry } from "../../domain/recipes/component.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import { readRecipeConfiguration } from "../recipe-configuration.ts";
import { recipeConfigurationKeys } from "../recipe-configuration.constants.ts";
import { observationComponents } from "./observation.ts";
import { nativeRecipeComponents, sandboxOptionsComponent } from "./native.ts";
import { secretSelectionComponent } from "./variables.ts";
import { recipeComponentGraph } from "./graph.ts";
import { reportSchema } from "./schemas.constants.ts";
import type {
  RecipeProject,
  RecipeProjectOptions,
  RecipeProjectValidation,
  RecipeReportDeclaration,
} from "./project.types.ts";

export async function readRecipeProject(
  options: RecipeProjectOptions,
): Promise<RecipeProject> {
  const file = resolve(options.file),
    config = resolve(options.config);
  if (file === config)
    throw new Error("Recipe and configuration require separate files");
  const [source, configurationSource] = await Promise.all([
    readRecipeFile(file),
    readRecipeFile(config),
  ]);
  let document;
  try {
    document = parseRecipe(source);
  } catch (error) {
    throw recipeFileError(file, source, error);
  }
  try {
    const configuration = recipeRecord(
      parseRecipeYaml(configurationSource).document.toJS({ maxAliasCount: 0 }),
      config,
    );
    if (configuration.version !== 1 && configuration.version !== 2)
      throw new Error(`${config}: configuration version must be 1 or 2`);
    const extra = new Set([
      "observation",
      "reports",
      "extensions",
      "experimental",
      "workspace",
      ...Object.keys(recipeFamilies),
    ]);
    for (const key of Object.keys(configuration)) {
      if (recipeConfigurationKeys.root.some((allowed) => allowed === key))
        continue;
      if (configuration.version === 2 && extra.has(key)) continue;
      throw new Error(`${config}: unknown configuration field ${key}`);
    }
    const legacySource = JSON.stringify({
      ...Object.fromEntries(
        Object.entries(configuration).filter(([key]) =>
          recipeConfigurationKeys.root.some((allowed) => allowed === key),
        ),
      ),
      version: 1,
      ...(configuration.version === 2
        ? { sandbox: { provider: "local" }, agents: {} }
        : {}),
    });
    const legacy = await readRecipeConfiguration(legacySource, config, false);
    for (const step of document.tasks) {
      if (
        step.agent &&
        !Object.hasOwn(
          configuration.version === 2
            ? recipeRecord(configuration.agents ?? {}, "agents")
            : (legacy.agents ?? {}),
          step.agent,
        )
      )
        throw new Error(`Unknown recipe agent: ${step.agent}`);
    }
    const registry = createRecipeRegistry({
      components: [
        ...observationComponents,
        ...nativeRecipeComponents,
        sandboxOptionsComponent,
        secretSelectionComponent,
        ...(options.registry?.components ?? []),
      ],
    });
    const directory = dirname(config);
    const graph = recipeComponentGraph(configuration, registry, directory);
    const reports = configuration.reports ?? [];
    if (!Array.isArray(reports)) throw new Error("reports must be a list");
    return {
      options,
      document,
      directory,
      configuration,
      legacy,
      registry,
      graph,
      reports: reports.map((value, index) =>
        validateRecipeSchema<RecipeReportDeclaration>(
          reportSchema,
          value,
          `reports.${index}`,
        ),
      ),
    };
  } catch (error) {
    throw recipeFileError(config, configurationSource, error);
  }
}

export async function validateRecipeProject(
  options: RecipeProjectOptions,
): Promise<RecipeProjectValidation> {
  const project = await readRecipeProject(options);
  return {
    name: project.document.name,
    version: project.document.version,
    configurationVersion: Number(project.configuration.version),
    tasks: project.document.tasks.map((task) => task.key),
    agents: [
      ...new Set(
        project.document.tasks.flatMap((task) =>
          task.agent ? [task.agent] : [],
        ),
      ),
    ],
    extensions: [...project.graph.nodes.values()]
      .filter((node) => node.extension)
      .map((node) => node.name),
  };
}
