import { open } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { pathToFileURL } from "node:url";
import { runRecipe } from "./recipe-run.ts";
import {
  publishRecipeReport,
  printRecipeErrors,
} from "../application/recipes/reports.ts";
import { recipeYamlCommand } from "./recipe-yaml.ts";
import { validateRecipeProject } from "../application/recipes/project.ts";
import type {
  RecipeBindings,
  RecipeConfiguration,
  FileRecipeConfiguration,
  MixedRecipeBindings,
} from "../application/recipe.types.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import { createSandbox } from "../application/sandbox.ts";
import { isFileSandboxOptions } from "../application/file-sandbox.ts";
import { readRecipeInputs } from "./recipe-inputs.ts";
import { initializeRecipe } from "./recipe-init.ts";
import { recipeCatalogCommand } from "./recipe-catalog.ts";
import { parseRecipe } from "../infrastructure/recipe.ts";
import { recipeLimits } from "../domain/recipe.constants.ts";
import { fallbackAgentKinds } from "../domain/fallback-agent.constants.ts";
import type { CliInvocation } from "./main.types.ts";

function assertBindings(value: unknown): asserts value is MixedRecipeBindings {
  if (!value || typeof value !== "object" || !("sandbox" in value))
    throw new Error("Recipe configuration must return { sandbox, agents? }");
  const sandbox = value.sandbox;
  if (
    !sandbox ||
    typeof sandbox !== "object" ||
    !("command" in sandbox) ||
    typeof sandbox.command !== "function" ||
    !("dispatch" in sandbox) ||
    typeof sandbox.dispatch !== "function" ||
    !("close" in sandbox) ||
    typeof sandbox.close !== "function" ||
    !("workspace" in sandbox) ||
    !sandbox.workspace ||
    typeof sandbox.workspace !== "object" ||
    !("close" in sandbox.workspace) ||
    typeof sandbox.workspace.close !== "function"
  )
    throw new Error("Recipe configuration must return an open Sandbox");
}

function validateAgents(agents: unknown): void {
  if (agents === undefined) return;
  if (!agents || typeof agents !== "object" || Array.isArray(agents))
    throw new Error("Recipe agents must be a mapping of composed agents");
  const registry: Record<string, unknown> = Object.fromEntries(
    Object.entries(agents),
  );
  for (const agent of Object.values(registry))
    if (
      !agent ||
      typeof agent !== "object" ||
      !("kind" in agent) ||
      typeof agent.kind !== "string" ||
      (!fallbackAgentKinds.has(agent.kind) && agent.kind !== "fallback")
    )
      throw new Error("Recipe agents must be composed Outpost agents");
}

function assertConfiguration(
  value: unknown,
): asserts value is RecipeConfiguration | FileRecipeConfiguration {
  if (
    !value ||
    typeof value !== "object" ||
    !("sandbox" in value) ||
    !value.sandbox ||
    typeof value.sandbox !== "object" ||
    Array.isArray(value.sandbox) ||
    "command" in value.sandbox
  )
    throw new Error(
      "Recipe configuration must export { sandbox: SandboxOptions, agents? } or a default bindings factory",
    );
  validateAgents("agents" in value ? value.agents : undefined);
}

function requireAgents(
  document: RecipeDocument,
  agents: RecipeBindings["agents"],
): void {
  for (const step of document.tasks)
    if (step.agent && !Object.hasOwn(agents ?? {}, step.agent))
      throw new Error(`Unknown recipe agent: ${step.agent}`);
}

async function readRecipe(file: string): Promise<string> {
  const handle = await open(file, "r");
  try {
    const buffer = Buffer.alloc(recipeLimits.bytes + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > recipeLimits.bytes) throw new Error("Recipe exceeds 1 MiB");
    return buffer.subarray(0, offset).toString("utf8");
  } finally {
    await handle.close();
  }
}

export async function recipeCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  if (positionals[1] === "list" || positionals[1] === "fetch")
    return recipeCatalogCommand({ values, positionals });
  if (positionals[1] === "init")
    return initializeRecipe({ values, positionals });
  if (positionals[1] === "validate") {
    if (!values.file)
      throw new Error("Recipe validate requires --file recipe.yaml");
    const document = parseRecipe(await readRecipe(resolve(values.file)));
    if (values.config) {
      if (!/\.ya?ml$/.test(values.config))
        throw new Error("Recipe validate only accepts YAML configuration");
      await validateRecipeProject({ file: values.file, config: values.config });
    }
    const report = {
      name: document.name,
      version: document.version,
      description: document.description,
      recipeVersion: document.recipeVersion,
      inputs: document.inputs,
      agents: [
        ...new Set(
          document.tasks.flatMap((task) => (task.agent ? [task.agent] : [])),
        ),
      ],
      tasks: document.tasks.map((task) => task.key),
    };
    process.stdout.write(
      values.json
        ? `${JSON.stringify(report)}\n`
        : `${document.name}: valid (${document.tasks.length} tasks)\n`,
    );
    return;
  }
  if (!values.file || !values.config)
    throw new Error(
      "Recipe run requires --file recipe.yaml and --config outpost.yaml",
    );
  const document = parseRecipe(await readRecipe(resolve(values.file)));
  const inputs =
    positionals[1] === "run" || values.input
      ? readRecipeInputs(document, values.input)
      : undefined;
  const configuration = resolve(values.config);
  if (
    ![".yaml", ".yml", ".ts", ".mts", ".js", ".mjs"].includes(
      extname(configuration),
    )
  )
    throw new Error(
      "Recipe configuration must be YAML or a .ts, .mts, .js or .mjs module",
    );
  if (/\.ya?ml$/.test(configuration))
    return recipeYamlCommand({ values, positionals }, inputs);
  if (positionals[1] !== "run" || values["run-id"])
    throw new Error("Durable recipe commands require YAML configuration");
  if (values.interactive === true || values.actor !== undefined)
    throw new Error("Interactive recipe commands require YAML configuration");
  const module: unknown = await import(pathToFileURL(configuration).href);
  if (!module || typeof module !== "object" || !("default" in module))
    throw new Error(
      "Recipe configuration must export a default bindings factory",
    );
  const controller = new AbortController();
  const cancel = (code: number) => {
    process.exitCode = code;
    controller.abort();
  };
  const interrupt = () => cancel(130);
  const terminate = () => cancel(143);
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", terminate);
  try {
    let bindings: unknown;
    if (typeof module.default === "function") {
      bindings = await module.default(controller.signal);
    } else {
      assertConfiguration(module.default);
      requireAgents(document, module.default.agents);
      const settings = { ...module.default.sandbox, signal: controller.signal };
      bindings = {
        sandbox: isFileSandboxOptions(settings)
          ? await createSandbox(settings)
          : await createSandbox(settings),
        agents: module.default.agents,
      };
    }
    assertBindings(bindings);
    try {
      validateAgents(bindings.agents);
    } catch (error) {
      await bindings.sandbox.close({ preserve: true });
      throw error;
    }
    const report = await runRecipe(
      document,
      { ...bindings, ...(inputs ? { inputs } : {}) },
      controller.signal,
    );
    publishRecipeReport(report, [], values.json ? "json" : undefined);
    printRecipeErrors(report);
    if (report.status !== "done" && !process.exitCode) process.exitCode = 1;
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
  }
}
