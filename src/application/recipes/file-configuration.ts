import { resolve } from "node:path";
import {
  configurationInvariant,
  ConfigurationError,
  locateConfiguration,
} from "../../domain/configuration-diagnostic.ts";
import { recipeTaskSourcePath } from "../../domain/recipe.ts";
import { recipeRecord, recipeReference } from "../../domain/recipes/values.ts";
import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
  WorkspaceRuntimeOptions,
} from "../../domain/file-workspace.types.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import { validateWorkspaceSelection } from "../../infrastructure/workspace-files.ts";
import { configurationBranch } from "../recipe-configuration-values.ts";
import { planFileWorkspace } from "./execution-plan.ts";
import type {
  NormalizedRecipeConfiguration,
  RecipeConfigurationPath as Path,
  RecipeFileWorkspaceDeclaration,
  RecipeNamedSandboxes,
  RecipeWorkspaceOutputsDeclaration,
} from "./file-configuration.types.ts";
import type {
  RecipeSandboxModel,
  RecipeWorkspaceDeclaration,
} from "./configuration-model.types.ts";
import { transportReference } from "../../infrastructure/transport-json.ts";
import { recipeWorkspaceKeys } from "./file-configuration.constants.ts";

function onlyKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  path: Path,
): void {
  const label = path.filter((key) => typeof key === "string").join(".");
  for (const key of Object.keys(value))
    configurationInvariant(
      allowed.includes(key),
      `Unsupported ${label} field: ${key}`,
      [...path, key],
      "unknown-field",
      `Remove ${key}; ${label} accepts ${allowed.join(", ")}.`,
    );
}

function stringPaths(value: unknown, path: Path): readonly string[] {
  configurationInvariant(
    Array.isArray(value) &&
      value.every((item: unknown) => typeof item === "string"),
    "Workspace paths must be strings",
    path,
  );
  locateConfiguration(path, () => validateWorkspaceSelection(value));
  return value;
}

function workspaceInputs(
  value: unknown,
  at: Path,
  directory: string,
): RecipeFileWorkspaceDeclaration["inputs"] {
  configurationInvariant(
    Array.isArray(value),
    "Workspace inputs must be a list",
    [...at, "inputs"],
  );
  return value.map((entry: unknown, index: number) => {
    const path = [...at, "inputs", index] as const;
    const input = recipeRecord(entry, `${at.join(".")}.inputs[${index}]`);
    onlyKeys(input, ["directory", "paths", "snapshot", "transporter"], path);
    if (input.directory !== undefined) {
      const message = "Directory workspace inputs cannot declare snapshots";
      configurationInvariant(typeof input.directory === "string", message, [
        ...path,
        "directory",
      ]);
      for (const key of ["snapshot", "transporter"])
        configurationInvariant(
          input[key] === undefined,
          message,
          [...path, key],
          "invalid-value",
          "Remove snapshot and transporter from a directory input.",
        );
      return {
        directory: resolve(directory, input.directory),
        ...(input.paths === undefined
          ? {}
          : { paths: stringPaths(input.paths, [...path, "paths"]) }),
      };
    }
    const reference = recipeRecord(
      input.transporter,
      [...path, "transporter"].join("."),
    );
    configurationInvariant(
      typeof reference.$ref === "string" && input.paths === undefined,
      "Snapshot input requires an explicit Transport reference",
      [...path, input.paths === undefined ? "transporter" : "paths"],
      "invalid-value",
      "Reference a declared Transport with { $ref: transports.<name> } and omit paths.",
    );
    return {
      snapshot: locateConfiguration([...path, "snapshot"], () =>
        transportReference(input.snapshot),
      ),
      transporter: reference.$ref,
    };
  });
}

function workspaceRetention(
  value: unknown,
  at: Path,
  runtime: WorkspaceRuntimeOptions,
): RecipeFileWorkspaceDeclaration["retention"] {
  const path = [...at, "retention"];
  const declaration = recipeRecord(value, path.join("."));
  onlyKeys(declaration, ["policy", "transporter"], path);
  configurationInvariant(
    declaration.policy === "run" ||
      declaration.policy === "local" ||
      declaration.policy === "portable",
    "Invalid workspace retention policy",
    [...path, "policy"],
    "invalid-value",
    "Use run, local or portable.",
  );
  if (declaration.policy === "portable") {
    const reference = recipeRecord(
      declaration.transporter,
      [...path, "transporter"].join("."),
    );
    configurationInvariant(
      typeof reference.$ref === "string",
      "Portable retention requires an explicit Transport reference and namespace",
      [...path, "transporter"],
      "invalid-value",
      "Reference a declared Transport with { $ref: transports.<name> }.",
    );
    configurationInvariant(
      runtime.namespace,
      "Portable retention requires an explicit Transport reference and namespace",
      path,
      "missing-field",
      "Declare runtime.namespace to name the portable records.",
    );
    return { policy: "portable", transporter: reference.$ref };
  }
  configurationInvariant(
    declaration.transporter === undefined,
    "Local retention cannot declare a Transport",
    [...path, "transporter"],
    "invalid-value",
    "Remove transporter, or use policy: portable.",
  );
  return { policy: declaration.policy };
}

function directorySource(
  workspace: Readonly<Record<string, unknown>>,
  at: Path,
  directory: string,
  paths: readonly string[] | undefined,
): FileWorkspaceSource {
  const label = at.join(".");
  configurationInvariant(
    typeof workspace.directory === "string",
    "Directory workspace requires directory",
    [...at, "directory"],
    "missing-field",
    `Declare ${label}.directory with the source directory.`,
  );
  const access =
    workspace.access === undefined || workspace.access === "copy"
      ? { mode: "copy" }
      : recipeRecord(workspace.access, `${label}.access`);
  onlyKeys(access, ["mode", "target", "readOnly"], [...at, "access"]);
  if (access.mode === "copy") {
    for (const key of ["target", "readOnly"])
      configurationInvariant(
        access[key] === undefined,
        "Copy access cannot declare mount options",
        [...at, "access", key],
        "invalid-value",
        "Remove target and readOnly, or use mode: mount.",
      );
    return {
      kind: "directory",
      directory: resolve(directory, workspace.directory),
      access: { mode: "copy" },
    };
  }
  configurationInvariant(
    access.mode === "mount",
    "Unsupported workspace kind or access mode",
    [...at, "access", "mode"],
    "invalid-value",
    "Use kind git, directory or ephemeral; directory access is copy or mount.",
  );
  const message = "Mount requires target and explicit readOnly, without paths";
  const hint = `Declare access.target and access.readOnly, and remove ${label}.paths.`;
  configurationInvariant(
    typeof access.target === "string",
    message,
    [...at, "access", "target"],
    "missing-field",
    hint,
  );
  configurationInvariant(
    typeof access.readOnly === "boolean",
    message,
    [...at, "access", "readOnly"],
    "missing-field",
    hint,
  );
  configurationInvariant(
    !paths,
    message,
    [...at, "paths"],
    "invalid-value",
    hint,
  );
  const target = access.target;
  locateConfiguration([...at, "access", "target"], () =>
    validateWorkspaceSelection([target]),
  );
  return {
    kind: "directory",
    directory: resolve(directory, workspace.directory),
    access: { mode: "mount", target: access.target, readOnly: access.readOnly },
  };
}

function workspaceOutputs(
  value: unknown,
  at: Path,
  directory: string,
): readonly WorkspaceOutputOptions[] {
  configurationInvariant(
    value === undefined || Array.isArray(value),
    "Workspace outputs must be a list",
    at,
  );
  return (value ?? []).map((declaration: unknown, index: number) => {
    const path = [...at, index] as const;
    const output = recipeRecord(declaration, `${at.join(".")}[${index}]`);
    onlyKeys(output, ["paths", "destination", "policy", "deleteMissing"], path);
    const message = "Invalid workspace publication declaration";
    configurationInvariant(
      typeof output.destination === "string",
      message,
      [...path, "destination"],
      "missing-field",
      "Declare destination with the host directory that receives the files.",
    );
    configurationInvariant(
      output.policy === "create" || output.policy === "update",
      message,
      [...path, "policy"],
      "invalid-value",
      "Use policy create or update.",
    );
    configurationInvariant(
      output.deleteMissing === undefined ||
        typeof output.deleteMissing === "boolean",
      message,
      [...path, "deleteMissing"],
      "invalid-value",
      "Use true or false.",
    );
    return {
      paths: stringPaths(output.paths, [...path, "paths"]),
      destination: resolve(directory, output.destination),
      policy: output.policy,
      ...(output.deleteMissing === undefined
        ? {}
        : { deleteMissing: output.deleteMissing }),
    };
  });
}

/** Reads one file workspace declaration; `outputs` is its own list or the configuration's. */
function fileWorkspace(
  workspace: Readonly<Record<string, unknown>> | undefined,
  at: Path,
  directory: string,
  runtime: WorkspaceRuntimeOptions,
  outputs: RecipeWorkspaceOutputsDeclaration,
): RecipeFileWorkspaceDeclaration {
  let source: FileWorkspaceSource | undefined;
  let retention: RecipeFileWorkspaceDeclaration["retention"];
  let paths: readonly string[] | undefined;
  let inputs: RecipeFileWorkspaceDeclaration["inputs"];
  if (workspace) {
    if (workspace.inputs !== undefined)
      inputs = workspaceInputs(workspace.inputs, at, directory);
    if (workspace.retention !== undefined)
      retention = workspaceRetention(workspace.retention, at, runtime);
    if (workspace.paths !== undefined)
      paths = stringPaths(workspace.paths, [...at, "paths"]);
    if (workspace.kind === "ephemeral") {
      configurationInvariant(
        workspace.directory === undefined &&
          workspace.access === undefined &&
          !paths,
        "Ephemeral workspace cannot declare directory inputs",
        [
          ...at,
          ["directory", "access", "paths"].find(
            (key) => workspace[key] !== undefined,
          ) ?? "kind",
        ],
        "invalid-value",
        "Remove directory, access and paths, or use kind: directory.",
      );
      source = { kind: "ephemeral" };
    }
    if (workspace.kind === "directory")
      source = directorySource(workspace, at, directory, paths);
    configurationInvariant(
      source,
      "Unsupported workspace kind or access mode",
      [...at, "kind"],
      "invalid-value",
      "Use kind git, directory or ephemeral; directory access is copy or mount.",
    );
  }
  const published = workspaceOutputs(outputs.value, outputs.path, directory);
  configurationInvariant(
    source || !published.length,
    "Workspace outputs require a workspace source",
    outputs.path,
    "missing-field",
    "Declare a workspace source, or remove outputs.",
  );
  return {
    ...(source ? { source } : {}),
    ...(retention ? { retention } : {}),
    ...(paths ? { paths } : {}),
    ...(inputs ? { inputs } : {}),
    outputs: published,
  };
}

function gitWorkspace(
  workspace: Readonly<Record<string, unknown>>,
  at: Path,
  directory: string,
) {
  onlyKeys(workspace, recipeWorkspaceKeys.git, at);
  const { kind: _kind, repository, branch, ...options } = workspace;
  configurationInvariant(
    typeof repository === "string",
    "Git workspace requires repository",
    [...at, "repository"],
    "missing-field",
    `Declare ${at.join(".")}.repository with the repository path.`,
  );
  return {
    declaration: {
      kind: "git" as const,
      repository: resolve(directory, repository),
      branch: locateConfiguration([...at, "branch"], () =>
        configurationBranch(branch),
      ),
    },
    branch,
    repository,
    options,
  };
}

/** Rejects two Git workspaces that would check out the same branch of one repository. */
function distinctBranches(
  workspaces: Readonly<Record<string, RecipeWorkspaceDeclaration>>,
): void {
  const used = new Map<string, string>();
  for (const [name, workspace] of Object.entries(workspaces)) {
    if (workspace.kind !== "git") continue;
    const branch = workspace.branch;
    const checkout =
      branch.mode === "current"
        ? "current"
        : "name" in branch && branch.name
          ? `named:${branch.name}`
          : undefined;
    if (!checkout) continue;
    const key = `${workspace.repository}\0${checkout}`;
    const other = used.get(key);
    configurationInvariant(
      other === undefined,
      `Workspaces ${other} and ${name} check out the same branch`,
      name === "" ? ["workspace", "branch"] : ["workspaces", name, "branch"],
      "invalid-value",
      "Give each Git workspace on one repository its own branch.",
    );
    used.set(key, name || "workspace");
  }
}

function namedSandboxes(
  configuration: Readonly<Record<string, unknown>>,
  workspaces: Readonly<Record<string, RecipeWorkspaceDeclaration>>,
): RecipeNamedSandboxes {
  const declarations: Record<string, Readonly<Record<string, unknown>>> = {};
  const models: Record<string, RecipeSandboxModel> = {};
  for (const [name, value] of Object.entries(
    recipeRecord(configuration.sandboxes ?? {}, "sandboxes"),
  )) {
    const { workspace, ...declaration } = recipeRecord(
      value,
      `sandboxes.${name}`,
    );
    const path = ["sandboxes", name, "workspace"];
    if (workspace === undefined) {
      models[name] = {};
      declarations[name] = declaration;
      continue;
    }
    const reference = locateConfiguration(path, () =>
      recipeReference(workspace),
    );
    const target = reference?.startsWith("workspaces.")
      ? reference.slice("workspaces.".length)
      : undefined;
    configurationInvariant(
      target !== undefined && Object.hasOwn(workspaces, target),
      `Sandbox ${name} references an unknown workspace`,
      path,
      "unknown-reference",
      "Reference a declared workspace with { $ref: workspaces.<name> }, or omit workspace to use the configuration workspace.",
    );
    models[name] = { workspace: target };
    declarations[name] = declaration;
  }
  return { declarations, models };
}

/** Reads the runtime directory and namespace that file workspaces keep their state under. */
function fileRuntime(
  configuration: Readonly<Record<string, unknown>>,
  directory: string,
): WorkspaceRuntimeOptions {
  const runtimeDeclaration = recipeRecord(
    configuration.runtime ?? {},
    "runtime",
  );
  onlyKeys(runtimeDeclaration, ["directory", "namespace"], ["runtime"]);
  configurationInvariant(
    runtimeDeclaration.directory === undefined ||
      typeof runtimeDeclaration.directory === "string",
    "Runtime directory must be a string",
    ["runtime", "directory"],
  );
  configurationInvariant(
    runtimeDeclaration.namespace === undefined ||
      typeof runtimeDeclaration.namespace === "string",
    "Runtime namespace must be a string",
    ["runtime", "namespace"],
  );
  configurationInvariant(
    runtimeDeclaration.namespace === undefined ||
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(runtimeDeclaration.namespace),
    "Invalid runtime namespace",
    ["runtime", "namespace"],
    "invalid-value",
    "Use 1 to 128 letters, digits, dots, underscores or hyphens, starting with a letter or digit.",
  );
  return {
    directory: resolve(directory, runtimeDeclaration.directory ?? ".outpost"),
    ...(runtimeDeclaration.namespace
      ? { namespace: runtimeDeclaration.namespace }
      : {}),
  };
}

/** Reads each workspace under `workspaces` with the reader of its own kind. */
function namedWorkspaces(
  declared: readonly (readonly [string, Readonly<Record<string, unknown>>])[],
  directory: string,
  runtime: WorkspaceRuntimeOptions,
) {
  const workspaces: Record<string, RecipeWorkspaceDeclaration> = {};
  const options: Record<string, Readonly<Record<string, unknown>>> = {};
  for (const [name, value] of declared) {
    const at = ["workspaces", name];
    if (value.kind === "git") {
      const named = gitWorkspace(value, at, directory);
      workspaces[name] = named.declaration;
      options[name] = named.options;
      continue;
    }
    onlyKeys(value, [...recipeWorkspaceKeys.file, "outputs"], at);
    workspaces[name] = {
      kind: "files",
      files: fileWorkspace(value, at, directory, runtime, {
        value: value.outputs,
        path: [...at, "outputs"],
      }),
    };
  }
  return { workspaces, options };
}

/** Plans the sandboxes that open a file workspace; Git sandboxes need no plan. */
function planFileSandboxes(
  sandboxes: RecipeNamedSandboxes,
  workspaces: Readonly<Record<string, RecipeWorkspaceDeclaration>>,
  main: RecipeWorkspaceDeclaration,
): void {
  for (const [name, model] of Object.entries(sandboxes.models)) {
    const target = model.workspace ? workspaces[model.workspace] : main;
    if (target?.kind !== "files") continue;
    const source = target.files.source;
    configurationInvariant(
      source,
      `Sandbox ${name} requires a workspace source`,
      ["sandboxes", name, model.workspace ? "workspace" : "provider"],
      "missing-field",
      "Declare the configuration workspace, or reference a declared workspace with { $ref: workspaces.<name> }.",
    );
    const planned = planFileWorkspace(source, sandboxes.declarations[name]!, [
      "sandboxes",
      name,
    ]);
    const [problem] = planned.diagnostics;
    if (problem) throw new ConfigurationError(problem);
    sandboxes.models[name] = { ...model, plan: planned };
  }
}

/** True when a task works in a file workspace: its sandbox's, or the configuration one. */
function fileTask(
  step: RecipeDocument["tasks"][number],
  sandboxes: RecipeNamedSandboxes,
  workspaces: Readonly<Record<string, RecipeWorkspaceDeclaration>>,
  main: RecipeWorkspaceDeclaration,
): boolean {
  const named =
    step.sandbox === undefined
      ? undefined
      : sandboxes.models[step.sandbox]?.workspace;
  return (named ? workspaces[named] : main)?.kind === "files";
}

export function normalizeRecipeWorkspaceConfiguration(
  configuration: Readonly<Record<string, unknown>>,
  directory: string,
  document: RecipeDocument,
): NormalizedRecipeConfiguration {
  if (configuration.version !== 3) return { configuration };
  configurationInvariant(
    configuration.repository === undefined &&
      configuration.branch === undefined,
    "Configuration 3 declares Git options inside workspace",
    [configuration.repository === undefined ? "branch" : "repository"],
    "misplaced-field",
    "Move repository and branch under workspace with kind: git.",
  );
  const workspace =
    configuration.workspace === undefined
      ? undefined
      : recipeRecord(configuration.workspace, "workspace");
  const declared = Object.entries(
    recipeRecord(configuration.workspaces ?? {}, "workspaces"),
  ).map(
    ([name, value]) =>
      [name, recipeRecord(value, `workspaces.${name}`)] as const,
  );
  const git = workspace?.kind === "git";
  const namedFiles = declared.some(([, value]) => value.kind !== "git");
  if (git) {
    configurationInvariant(
      configuration.outputs === undefined &&
        (configuration.runtime === undefined || namedFiles),
      "Git configuration retains repository control storage and integration; file runtime and outputs require a file workspace",
      [configuration.outputs === undefined ? "runtime" : "outputs"],
      "file-workspace-only",
      "Remove runtime and outputs, or declare a file workspace; a named file workspace declares its own outputs.",
    );
    const runtime = fileRuntime(configuration, directory);
    const main = gitWorkspace(workspace, ["workspace"], directory);
    const { workspaces, options } = namedWorkspaces(
      declared,
      directory,
      runtime,
    );
    distinctBranches({ "": main.declaration, ...workspaces });
    const sandboxes = namedSandboxes(configuration, workspaces);
    planFileSandboxes(sandboxes, workspaces, main.declaration);
    const { runtime: _runtime, ...components } = configuration;
    return {
      configuration: {
        ...components,
        repository: main.repository,
        ...(main.branch ? { branch: main.branch } : {}),
        workspace: main.options,
        workspaces: options,
        sandboxes: sandboxes.declarations,
      },
      workspaces,
      sandboxes: sandboxes.models,
      ...(namedFiles ? { runtime } : {}),
    };
  }
  const namedGit = declared.some(([, value]) => value.kind === "git");
  configurationInvariant(
    configuration.integration === undefined || namedGit,
    "Git integration is unavailable for file workspaces",
    ["integration"],
    "git-workspace-only",
    "Remove integration; file workspaces publish declared outputs instead.",
  );
  for (const step of document.tasks)
    configurationInvariant(
      !step.speculation,
      "Git speculation is unavailable for file workspaces",
      [...recipeTaskSourcePath(document, step), "speculation"],
      "git-workspace-only",
      "Run speculation with a Git workspace, or remove it.",
    );
  const runtime = fileRuntime(configuration, directory);
  if (workspace) onlyKeys(workspace, recipeWorkspaceKeys.file, ["workspace"]);
  const main = fileWorkspace(workspace, ["workspace"], directory, runtime, {
    value: configuration.outputs,
    path: ["outputs"],
  });
  const { workspaces, options } = namedWorkspaces(declared, directory, runtime);
  distinctBranches(workspaces);
  const needsSandbox = document.tasks.some(
    (step) => (step.command || step.agent) && step.sandbox === undefined,
  );
  configurationInvariant(
    !needsSandbox || (main.source && configuration.sandbox),
    "Sandbox tasks require an explicit workspace source and sandbox",
    [main.source ? "sandbox" : "workspace"],
    "missing-field",
    "Declare workspace and sandbox for command and agent tasks.",
  );
  const sandbox = recipeRecord(
    configuration.sandbox ?? { provider: "local" },
    "sandbox",
  );
  const plan = planFileWorkspace(main.source, sandbox);
  const [diagnostic] = plan.diagnostics;
  if (diagnostic) throw new ConfigurationError(diagnostic);
  const sandboxes = namedSandboxes(configuration, workspaces);
  const declaration = { kind: "files" as const, files: main };
  planFileSandboxes(sandboxes, workspaces, declaration);
  for (const step of document.tasks)
    if (
      step.brief !== undefined &&
      fileTask(step, sandboxes, workspaces, declaration)
    )
      configurationInvariant(
        !/\{\{\s*(WORK_BRANCH|BASE_BRANCH)\s*\}\}/.test(step.brief),
        "Git branch variables are unavailable in file workspaces",
        [...recipeTaskSourcePath(document, step), "brief"],
        "git-workspace-only",
        "Remove {{ WORK_BRANCH }} and {{ BASE_BRANCH }}; file workspaces have no branches.",
      );
  const {
    runtime: _runtime,
    outputs: _outputs,
    workspaces: _workspaces,
    ...components
  } = configuration;
  return {
    configuration: {
      ...components,
      workspace: {},
      ...(namedGit ? { workspaces: options } : {}),
      sandbox,
      sandboxes: sandboxes.declarations,
    },
    files: { ...main, plan, runtime },
    workspaces,
    sandboxes: sandboxes.models,
    runtime,
  };
}
