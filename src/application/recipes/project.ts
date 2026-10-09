import { validateRecipeProjectExpressions } from "./project-expressions.ts";
import { validateRecipeConcurrency } from "./workflow.ts";
import { workflowOptionComponents } from "./workflow-components.ts";
import { recipeFileError } from "../../infrastructure/recipes/diagnostic.ts";
import { dirname, resolve } from "node:path";
import { parseRecipe, parseRecipeYaml } from "../../infrastructure/recipe.ts";
import { readRecipeFile } from "../../infrastructure/recipes/read.ts";
import { recipeFamilies } from "../../domain/recipes/schema.constants.ts";
import { recipeRecord } from "../../domain/recipes/values.ts";
import { createRecipeRegistry } from "../../domain/recipes/component.ts";
import {
  validateRecipeSchema,
  recipeJsonValidator,
} from "../../infrastructure/recipes/schema.ts";
import { readRecipeConfiguration } from "../recipe-configuration.ts";
import { recipeConfigurationKeys } from "../recipe-configuration.constants.ts";
import { observationComponents } from "./observation.ts";
import {
  nativeRecipeComponents,
  sandboxOptionsComponent,
  dispatchOptionsComponent,
} from "./native.ts";
import { secretSelectionComponent } from "./variables.ts";
import { recipeComponentGraph } from "./graph.ts";
import { reportSchema } from "./schemas.constants.ts";
import { normalizeRecipeWorkspaceConfiguration } from "./file-configuration.ts";
import { validateFileRecipeCapabilities } from "./file-validation.ts";
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
    for (const [name, input] of Object.entries(document.inputs)) {
      if (!input.schema) continue;
      recipeJsonValidator(input.schema);
      if (Object.hasOwn(input, "default"))
        validateRecipeSchema(
          input.schema,
          input.default,
          `inputs.${name}.default`,
        );
    }
    if (typeof document.workflow?.concurrency === "number")
      validateRecipeConcurrency(document, document.workflow.concurrency);
  } catch (error) {
    throw recipeFileError(file, source, error);
  }
  try {
    const configuration = recipeRecord(
      parseRecipeYaml(configurationSource).document.toJS({ maxAliasCount: 0 }),
      config,
    );
    if (
      configuration.version !== 1 &&
      configuration.version !== 2 &&
      configuration.version !== 3
    )
      throw new Error(`${config}: configuration version must be 1, 2 or 3`);
    if (
      configuration.experimental !== undefined &&
      typeof configuration.experimental !== "boolean"
    )
      throw new Error("experimental must be a boolean");
    const extra = new Set([
      "observation",
      "reports",
      "extensions",
      "experimental",
      "integration",
      "workspace",
      "runtime",
      "outputs",
      ...Object.keys(recipeFamilies),
    ]);
    for (const key of Object.keys(configuration)) {
      if (recipeConfigurationKeys.root.some((allowed) => allowed === key))
        continue;
      if (
        configuration.version === 2 &&
        extra.has(key) &&
        !["runtime", "outputs"].includes(key)
      )
        continue;
      if (configuration.version === 3 && extra.has(key)) continue;
      throw new Error(`${config}: unknown configuration field ${key}`);
    }
    const normalized = normalizeRecipeWorkspaceConfiguration(
      configuration,
      dirname(config),
      document,
    );
    const normalizedConfiguration = normalized.configuration;
    const legacySource = JSON.stringify({
      ...Object.fromEntries(
        Object.entries(normalizedConfiguration).filter(([key]) =>
          recipeConfigurationKeys.root.some((allowed) => allowed === key),
        ),
      ),
      version: 1,
      ...(normalizedConfiguration.version === 2
        ? { sandbox: { provider: "local" }, agents: {} }
        : {}),
    });
    const legacy = normalized.files
      ? { sandbox: {}, agents: {} }
      : await readRecipeConfiguration(legacySource, config, false);
    for (const step of document.tasks) {
      if (
        step.agent &&
        !Object.hasOwn(
          normalizedConfiguration.version === 2
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
        ...workflowOptionComponents,
        sandboxOptionsComponent,
        dispatchOptionsComponent,
        secretSelectionComponent,
        ...(options.registry?.components ?? []),
      ],
    });
    const directory = dirname(config);
    let graph;
    try {
      graph = recipeComponentGraph(
        normalizedConfiguration,
        registry,
        directory,
        document,
      );
      validateRecipeProjectExpressions(document, graph);
      if (normalized.files) validateFileRecipeCapabilities(document, graph);
      if (
        normalized.files?.retention?.policy === "portable" &&
        graph.nodes.get(normalized.files.retention.transporter)?.kind !==
          "transport"
      )
        throw new Error(
          "Portable workspace retention references an unknown Transport",
        );
      for (const input of normalized.files?.inputs ?? [])
        if (
          "snapshot" in input &&
          graph.nodes.get(input.transporter)?.kind !== "transport"
        )
          throw new Error(
            "Workspace snapshot input references an unknown Transport",
          );
    } catch (error) {
      if (
        error instanceof Error &&
        /(?:tasks\.[\w.-]+|workflow)(?:\.|:)/.test(error.message)
      )
        throw recipeFileError(file, source, error);
      throw error;
    }
    const reports = configuration.reports ?? [];
    if (!Array.isArray(reports)) throw new Error("reports must be a list");
    return {
      options,
      document,
      directory,
      configuration,
      componentConfiguration: normalizedConfiguration,
      legacy,
      ...(normalized.files ? { files: normalized.files } : {}),
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
    if (error instanceof Error && error.message.startsWith(`${file}:`))
      throw error;
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
