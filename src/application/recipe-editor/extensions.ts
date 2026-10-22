import { access } from "node:fs/promises";
import { posix } from "node:path";
import { configurationError } from "../../domain/configuration-diagnostic.ts";
import { OutpostError } from "../../domain/errors.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import {
  readEditorFile,
  writeEditorFile,
} from "../../infrastructure/editor-files.ts";
import { executeProcess } from "../../infrastructure/process.ts";
import { nativeRecipeGuards } from "../recipes/native.ts";
import { nativeRecipeSchemas } from "../recipes/native-schemas.constants.ts";
import {
  recipeEditorCommonContracts,
  recipeEditorModuleTypes,
  recipeEditorNamePatterns,
  recipeEditorVerifyLimits,
} from "./extensions.constants.ts";
import { recipeEditorDefaults } from "./starters.constants.ts";
import type {
  EditorFile,
  EditorRoot,
} from "../../infrastructure/editor-files.types.ts";
import type { RecipeEditorOperation } from "../../domain/recipes/editor.types.ts";
import type {
  RecipeEditorContract,
  RecipeEditorExtension,
  RecipeEditorExtensionCreation,
  RecipeEditorExtensionRequest,
  RecipeEditorScaffold,
  RecipeEditorVerification,
  RecipeEditorVerifyOptions,
} from "./extensions.types.ts";
import type { RecipeEditorSession } from "./session.types.ts";

let contracts: readonly RecipeEditorContract[] | undefined;

/** Every contract annotated in the native component schemas, common ones first. */
export function recipeEditorContracts(): readonly RecipeEditorContract[] {
  if (contracts) return contracts;
  const found = new Map<string, RecipeEditorContract>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!recipeObject(value)) return;
    if (
      typeof value.component === "string" &&
      typeof value.contract === "string"
    )
      found.set(`${value.component} ${value.contract}`, {
        kind: value.component,
        contract: value.contract,
      });
    Object.values(value).forEach(visit);
  };
  visit(nativeRecipeSchemas);
  const common: readonly string[] = recipeEditorCommonContracts;
  const rank = (item: RecipeEditorContract) => {
    const index = common.indexOf(item.contract);
    return index < 0 ? common.length : index;
  };
  contracts = [...found.values()].sort(
    (left, right) =>
      rank(left) - rank(right) || left.contract.localeCompare(right.contract),
  );
  return contracts;
}

/** Component kinds an extension may provide; schemas only annotate callback contracts. */
export function recipeEditorExtensionKinds(): readonly string[] {
  const kinds = Object.keys(nativeRecipeGuards).filter(
    (kind) => kind !== "callback",
  );
  return ["callback", ...kinds.sort()];
}

/** Path of a relative module from the configuration, or undefined for packages. */
export function recipeEditorModulePath(
  config: string,
  module: string,
): string | undefined {
  if (!/^\.\.?\//.test(module)) return undefined;
  const path = posix.normalize(posix.join(posix.dirname(config), module));
  return path.startsWith("../") ? undefined : path;
}

async function locatedFile(root: EditorRoot, path: string | undefined) {
  if (!path) return false;
  try {
    await access(await root.locate(path));
    return true;
  } catch {
    return false;
  }
}

const text = (value: unknown) =>
  typeof value === "string" ? value : undefined;

/** Extensions declared by the configuration draft, with their module files. */
export async function recipeEditorExtensions(
  session: RecipeEditorSession,
): Promise<readonly RecipeEditorExtension[]> {
  const config = session.state().config;
  if (!config || !recipeObject(config.value)) return [];
  const declared = recipeObject(config.value.extensions)
    ? config.value.extensions
    : {};
  const functions = recipeObject(config.value.functions)
    ? config.value.functions
    : {};
  return Promise.all(
    Object.entries(declared).map(async ([name, value]) => {
      const declaration = recipeObject(value) ? value : {};
      const module = text(declaration.module) ?? "";
      const path = recipeEditorModulePath(config.path, module);
      const contract = text(declaration.contract);
      const version = text(declaration.version);
      return {
        name,
        module,
        export: text(declaration.export) ?? "",
        kind: text(declaration.kind) ?? "",
        ...(contract ? { contract } : {}),
        ...(version ? { version } : {}),
        ...(path ? { path } : {}),
        exists: await locatedFile(session.root, path),
        functions: Object.entries(functions).flatMap(([alias, target]) =>
          recipeObject(target) && target.$ref === `extensions.${name}`
            ? [alias]
            : [],
        ),
      };
    }),
  );
}

const functionScaffold: RecipeEditorScaffold = (name, request) =>
  `/** ${request.contract ? `Callback for ${request.contract}` : `${request.kind} function`}; the engine validates its result. */
export async function ${name}(value: unknown): Promise<unknown> {
  return value;
}
`;

const scaffolds: Readonly<Record<string, RecipeEditorScaffold>> = {
  callback: functionScaffold,
  job: functionScaffold,
  resolver: functionScaffold,
  triggerMapper: functionScaffold,
  verifier: functionScaffold,
  sink: (name) =>
    `/** Observation sink: receives every event of the recipe runs it observes. */
export const ${name} = {
  observe(event: unknown): void {
    console.error(JSON.stringify(event));
  },
};
`,
};

const scaffold: RecipeEditorScaffold = (name, request) =>
  `/** ${request.kind} component: add the methods its contract requires before verifying. */
export const ${name} = {};
`;

function checkRequest(
  request: RecipeEditorExtensionRequest,
  declared: Readonly<Record<string, unknown>>,
  functions: Readonly<Record<string, unknown>>,
): void {
  if (!recipeEditorNamePatterns.extension.test(request.name))
    throw configurationError(
      "Extension names use letters, digits, dashes and underscores",
      ["extensions", request.name],
      "invalid-value",
    );
  if (!recipeEditorNamePatterns.export.test(request.export))
    throw configurationError(
      `${request.export} is not a valid export name`,
      ["extensions", request.name, "export"],
      "invalid-value",
    );
  if (!recipeEditorModuleTypes.some((type) => request.module.endsWith(type)))
    throw configurationError(
      "Extension modules are TypeScript or JavaScript files",
      ["extensions", request.name, "module"],
      "invalid-value",
      `Use one of ${recipeEditorModuleTypes.join(", ")}.`,
    );
  if (Object.hasOwn(declared, request.name))
    throw configurationError(
      `Extension ${request.name} is already declared`,
      ["extensions", request.name],
      "duplicate-key",
    );
  if (request.function && Object.hasOwn(functions, request.function))
    throw configurationError(
      `Function ${request.function} is already declared`,
      ["functions", request.function],
      "duplicate-key",
    );
}

/** Declares an extension in the configuration draft and creates its module when missing. */
export async function createRecipeEditorExtension(
  session: RecipeEditorSession,
  request: RecipeEditorExtensionRequest,
): Promise<RecipeEditorExtensionCreation> {
  const config = session.state().config;
  if (!config || !recipeObject(config.value))
    throw new OutpostError(
      "configuration",
      "Open a valid configuration before adding extensions",
    );
  const declared = recipeObject(config.value.extensions)
    ? config.value.extensions
    : {};
  const functions = recipeObject(config.value.functions)
    ? config.value.functions
    : {};
  checkRequest(request, declared, functions);
  const path = recipeEditorModulePath(config.path, request.module);
  if (!path)
    throw configurationError(
      "Extension modules must be relative paths inside the editor directory",
      ["extensions", request.name, "module"],
      "invalid-value",
      "Start the path with ./ from the configuration directory.",
    );
  const operations: RecipeEditorOperation[] = [
    {
      type: "set",
      path: ["extensions", request.name],
      value: {
        module: request.module,
        export: request.export,
        kind: request.kind,
        ...(request.contract ? { contract: request.contract } : {}),
        version: "1",
      },
    },
    ...(request.function
      ? [
          {
            type: "set" as const,
            path: ["functions", request.function],
            value: { $ref: `extensions.${request.name}` },
          },
        ]
      : []),
  ];
  const state = await session.edit("config", operations, request.revision);
  const existing = await readEditorFile(
    session.root,
    path,
    recipeEditorDefaults.extensionBytes,
  );
  if (existing) return { state, path, created: false };
  const write = scaffolds[request.kind] ?? scaffold;
  await writeEditorFile(
    session.root,
    path,
    write(request.export, request),
    null,
  );
  return { state, path, created: true };
}

function modulePath(path: string): string {
  if (!recipeEditorModuleTypes.some((type) => path.endsWith(type)))
    throw new OutpostError(
      "configuration",
      "The editor only opens TypeScript and JavaScript modules",
    );
  return path;
}

export async function readRecipeEditorModule(
  root: EditorRoot,
  path: string,
): Promise<EditorFile> {
  const file = await readEditorFile(
    root,
    modulePath(path),
    recipeEditorDefaults.extensionBytes,
  );
  if (!file) throw new OutpostError("configuration", `${path} does not exist`);
  return file;
}

export async function writeRecipeEditorModule(
  root: EditorRoot,
  path: string,
  text: string,
  expected: string | null,
): Promise<EditorFile> {
  if (Buffer.byteLength(text) > recipeEditorDefaults.extensionBytes)
    throw new OutpostError("configuration", `${path} is too large to save`);
  return writeEditorFile(root, modulePath(path), text, expected);
}

function failureMessage(stderr: string): string {
  const lines = stderr.trim().split("\n").filter(Boolean);
  return (
    lines.at(-1)?.replace(/^Error:\s*/, "") ?? "Extension verification failed"
  );
}

/** Runs `recipe validate --extensions` on the saved files in a separate process. */
export async function verifyRecipeEditorExtensions({
  session,
  cli,
  signal,
}: RecipeEditorVerifyOptions): Promise<RecipeEditorVerification> {
  const state = session.state();
  const files = session.files();
  const [executable, ...prefix] = cli;
  if (!executable || !files.recipe || !files.config)
    throw new OutpostError(
      "configuration",
      "Open a recipe and a configuration to verify extensions",
    );
  if (
    !state.recipe?.exists ||
    !state.config?.exists ||
    state.recipe.dirty ||
    state.config.dirty
  )
    throw new OutpostError(
      "configuration",
      "Save the recipe and configuration before verifying extensions",
    );
  const result = await executeProcess({
    executable,
    arguments: [
      ...prefix,
      "recipe",
      "validate",
      "--file",
      files.recipe,
      "--config",
      files.config,
      "--extensions",
      "--json",
    ],
    directory: session.root.directory,
    deadlineMs: recipeEditorVerifyLimits.deadlineMs,
    retain: recipeEditorVerifyLimits.retainBytes,
    signal,
  });
  if (result.status !== 0)
    return {
      ok: false,
      extensions: [],
      message: failureMessage(result.stderr),
    };
  const report: unknown = JSON.parse(result.stdout);
  const extensions =
    recipeObject(report) && Array.isArray(report.extensions)
      ? report.extensions.filter(
          (name): name is string => typeof name === "string",
        )
      : [];
  return { ok: true, extensions };
}
