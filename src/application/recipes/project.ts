import {
  configurationError,
  ConfigurationError,
} from "../../domain/configuration-diagnostic.ts";
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
import { recipeJsonValidator } from "../../infrastructure/recipes/schema.ts";
import {
  createJsonDecoder,
  validateJsonSchema,
} from "../../infrastructure/json-schema.ts";
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
import { readRecipeConfigurationModel } from "./configuration-model.ts";
import { validateFileRecipeCapabilities } from "./file-validation.ts";
import type {
  RecipeProject,
  RecipeProjectOptions,
  RecipeProjectValidation,
  RecipeReportDeclaration,
} from "./project.types.ts";

const reportDeclaration = createJsonDecoder<RecipeReportDeclaration>(
  reportSchema,
  "reports",
);

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
        validateJsonSchema(
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
      throw configurationError(
        `Unknown configuration field ${key}`,
        [key],
        "unknown-field",
        `Remove ${key} or move it under the section that declares it.`,
      );
    }
    const model = await readRecipeConfigurationModel(
      configuration,
      config,
      document,
    );
    const files =
      model.workspace.kind === "files" ? model.workspace.files : undefined;
    for (const step of document.tasks) {
      if (step.agent && !model.agents.includes(step.agent))
        throw configurationError(
          `Unknown recipe agent: ${step.agent}`,
          ["tasks", document.tasks.indexOf(step), "agent"],
          "unknown-agent",
          `Declare agents.${step.agent} in the execution configuration.`,
        );
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
    const graph = recipeComponentGraph(
      model.components,
      registry,
      directory,
      document,
    );
    validateRecipeProjectExpressions(document, graph);
    if (files) validateFileRecipeCapabilities(document, graph);
    if (
      files?.retention?.policy === "portable" &&
      graph.nodes.get(files.retention.transporter)?.kind !== "transport"
    )
      throw new Error(
        "Portable workspace retention references an unknown Transport",
      );
    for (const input of files?.inputs ?? [])
      if (
        "snapshot" in input &&
        graph.nodes.get(input.transporter)?.kind !== "transport"
      )
        throw new Error(
          "Workspace snapshot input references an unknown Transport",
        );
    const reports = configuration.reports ?? [];
    if (!Array.isArray(reports))
      throw configurationError("reports must be a list", ["reports"]);
    return {
      options,
      document,
      directory,
      configuration,
      model,
      ...(files ? { files } : {}),
      registry,
      graph,
      reports: reports.map((value, index) =>
        reportDeclaration.parse(value, `reports.${index}`),
      ),
    };
  } catch (error) {
    if (error instanceof ConfigurationError) {
      if (error.diagnostic.file) throw error;
      if (["tasks", "workflow"].includes(String(error.diagnostic.path[0])))
        throw recipeFileError(file, source, error);
    }
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
