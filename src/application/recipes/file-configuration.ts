import { resolve } from "node:path";
import {
  configurationInvariant,
  ConfigurationError,
  locateConfiguration,
} from "../../domain/configuration-diagnostic.ts";
import { recipeTaskSourcePath } from "../../domain/recipe.ts";
import { recipeRecord } from "../../domain/recipes/values.ts";
import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
} from "../../domain/file-workspace.types.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import { validateWorkspaceSelection } from "../../infrastructure/workspace-files.ts";
import { planFileWorkspace } from "./execution-plan.ts";
import type { NormalizedRecipeConfiguration } from "./file-configuration.types.ts";
import type { RecipeFileConfiguration } from "./file-configuration.types.ts";
import { transportReference } from "../../infrastructure/transport-json.ts";

function onlyKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  path: readonly (string | number)[],
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

function stringPaths(
  value: unknown,
  path: readonly (string | number)[],
): readonly string[] {
  configurationInvariant(
    Array.isArray(value) &&
      value.every((item: unknown) => typeof item === "string"),
    "Workspace paths must be strings",
    path,
  );
  locateConfiguration(path, () => validateWorkspaceSelection(value));
  return value;
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
  if (workspace?.kind === "git") {
    configurationInvariant(
      configuration.runtime === undefined &&
        configuration.outputs === undefined,
      "Git configuration retains repository control storage and integration; file runtime and outputs require a file workspace",
      [configuration.runtime === undefined ? "outputs" : "runtime"],
      "file-workspace-only",
      "Remove runtime and outputs, or declare a file workspace.",
    );
    onlyKeys(
      workspace,
      [
        "kind",
        "repository",
        "branch",
        "copies",
        "guard",
        "hooks",
        "limits",
        "label",
        "storageQuota",
      ],
      ["workspace"],
    );
    const { kind: _kind, repository, branch, ...options } = workspace;
    configurationInvariant(
      typeof repository === "string",
      "Git workspace requires repository",
      ["workspace", "repository"],
      "missing-field",
      "Declare workspace.repository with the repository path.",
    );
    return {
      configuration: {
        ...configuration,
        repository,
        ...(branch ? { branch } : {}),
        workspace: options,
      },
    };
  }
  configurationInvariant(
    configuration.integration === undefined,
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
  for (const step of document.tasks)
    if (step.brief !== undefined)
      configurationInvariant(
        !/\{\{\s*(WORK_BRANCH|BASE_BRANCH)\s*\}\}/.test(step.brief),
        "Git branch variables are unavailable in file workspaces",
        [...recipeTaskSourcePath(document, step), "brief"],
        "git-workspace-only",
        "Remove {{ WORK_BRANCH }} and {{ BASE_BRANCH }}; file workspaces have no branches.",
      );
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
  const runtime = {
    directory: resolve(directory, runtimeDeclaration.directory ?? ".outpost"),
    ...(runtimeDeclaration.namespace
      ? { namespace: runtimeDeclaration.namespace }
      : {}),
  };
  configurationInvariant(
    runtimeDeclaration.namespace === undefined ||
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(runtimeDeclaration.namespace),
    "Invalid runtime namespace",
    ["runtime", "namespace"],
    "invalid-value",
    "Use 1 to 128 letters, digits, dots, underscores or hyphens, starting with a letter or digit.",
  );
  let source: FileWorkspaceSource | undefined;
  let retention: RecipeFileConfiguration["retention"];
  let paths: readonly string[] | undefined;
  let inputs: RecipeFileConfiguration["inputs"];
  if (workspace) {
    onlyKeys(
      workspace,
      ["kind", "directory", "access", "paths", "retention", "inputs"],
      ["workspace"],
    );
    if (workspace.inputs !== undefined) {
      configurationInvariant(
        Array.isArray(workspace.inputs),
        "Workspace inputs must be a list",
        ["workspace", "inputs"],
      );
      inputs = workspace.inputs.map((value: unknown, index: number) => {
        const path = ["workspace", "inputs", index] as const;
        const input = recipeRecord(value, `workspace.inputs[${index}]`);
        onlyKeys(
          input,
          ["directory", "paths", "snapshot", "transporter"],
          path,
        );
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
          `workspace.inputs[${index}].transporter`,
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
    if (workspace.retention !== undefined) {
      const declaration = recipeRecord(
        workspace.retention,
        "workspace.retention",
      );
      onlyKeys(
        declaration,
        ["policy", "transporter"],
        ["workspace", "retention"],
      );
      configurationInvariant(
        declaration.policy === "run" ||
          declaration.policy === "local" ||
          declaration.policy === "portable",
        "Invalid workspace retention policy",
        ["workspace", "retention", "policy"],
        "invalid-value",
        "Use run, local or portable.",
      );
      if (declaration.policy === "portable") {
        const reference = recipeRecord(
          declaration.transporter,
          "workspace.retention.transporter",
        );
        configurationInvariant(
          typeof reference.$ref === "string",
          "Portable retention requires an explicit Transport reference and namespace",
          ["workspace", "retention", "transporter"],
          "invalid-value",
          "Reference a declared Transport with { $ref: transports.<name> }.",
        );
        configurationInvariant(
          runtime.namespace,
          "Portable retention requires an explicit Transport reference and namespace",
          ["workspace", "retention"],
          "missing-field",
          "Declare runtime.namespace to name the portable records.",
        );
        retention = { policy: "portable", transporter: reference.$ref };
      }
      if (declaration.policy === "run" || declaration.policy === "local") {
        configurationInvariant(
          declaration.transporter === undefined,
          "Local retention cannot declare a Transport",
          ["workspace", "retention", "transporter"],
          "invalid-value",
          "Remove transporter, or use policy: portable.",
        );
        retention = { policy: declaration.policy };
      }
    }
    if (workspace.paths !== undefined)
      paths = stringPaths(workspace.paths, ["workspace", "paths"]);
    if (workspace.kind === "ephemeral") {
      configurationInvariant(
        workspace.directory === undefined &&
          workspace.access === undefined &&
          !paths,
        "Ephemeral workspace cannot declare directory inputs",
        [
          "workspace",
          ["directory", "access", "paths"].find(
            (key) => workspace[key] !== undefined,
          ) ?? "kind",
        ],
        "invalid-value",
        "Remove directory, access and paths, or use kind: directory.",
      );
      source = { kind: "ephemeral" };
    }
    if (workspace.kind === "directory") {
      configurationInvariant(
        typeof workspace.directory === "string",
        "Directory workspace requires directory",
        ["workspace", "directory"],
        "missing-field",
        "Declare workspace.directory with the source directory.",
      );
      const access =
        workspace.access === undefined || workspace.access === "copy"
          ? { mode: "copy" }
          : recipeRecord(workspace.access, "workspace.access");
      onlyKeys(access, ["mode", "target", "readOnly"], ["workspace", "access"]);
      if (access.mode === "copy") {
        for (const key of ["target", "readOnly"])
          configurationInvariant(
            access[key] === undefined,
            "Copy access cannot declare mount options",
            ["workspace", "access", key],
            "invalid-value",
            "Remove target and readOnly, or use mode: mount.",
          );
        source = {
          kind: "directory",
          directory: resolve(directory, workspace.directory),
          access: { mode: "copy" },
        };
      }
      if (access.mode === "mount") {
        const message =
          "Mount requires target and explicit readOnly, without paths";
        const hint =
          "Declare access.target and access.readOnly, and remove workspace.paths.";
        configurationInvariant(
          typeof access.target === "string",
          message,
          ["workspace", "access", "target"],
          "missing-field",
          hint,
        );
        configurationInvariant(
          typeof access.readOnly === "boolean",
          message,
          ["workspace", "access", "readOnly"],
          "missing-field",
          hint,
        );
        configurationInvariant(
          !paths,
          message,
          ["workspace", "paths"],
          "invalid-value",
          hint,
        );
        const target = access.target;
        locateConfiguration(["workspace", "access", "target"], () =>
          validateWorkspaceSelection([target]),
        );
        source = {
          kind: "directory",
          directory: resolve(directory, workspace.directory),
          access: {
            mode: "mount",
            target: access.target,
            readOnly: access.readOnly,
          },
        };
      }
    }
    configurationInvariant(
      source,
      "Unsupported workspace kind or access mode",
      workspace.kind === "directory"
        ? ["workspace", "access", "mode"]
        : ["workspace", "kind"],
      "invalid-value",
      "Use kind git, directory or ephemeral; directory access is copy or mount.",
    );
  }
  const needsSandbox = document.tasks.some(
    (step) => step.command || step.agent,
  );
  configurationInvariant(
    !needsSandbox || (source && configuration.sandbox),
    "Sandbox tasks require an explicit workspace source and sandbox",
    [source ? "sandbox" : "workspace"],
    "missing-field",
    "Declare workspace and sandbox for command and agent tasks.",
  );
  const sandbox = recipeRecord(
    configuration.sandbox ?? { provider: "local" },
    "sandbox",
  );
  const plan = planFileWorkspace(source, sandbox);
  const [diagnostic] = plan.diagnostics;
  if (diagnostic) throw new ConfigurationError(diagnostic);
  configurationInvariant(
    configuration.outputs === undefined || Array.isArray(configuration.outputs),
    "Workspace outputs must be a list",
    ["outputs"],
  );
  const outputs: WorkspaceOutputOptions[] = (configuration.outputs ?? []).map(
    (declaration: unknown, index: number) => {
      const path = ["outputs", index] as const;
      const output = recipeRecord(declaration, `outputs[${index}]`);
      onlyKeys(
        output,
        ["paths", "destination", "policy", "deleteMissing"],
        path,
      );
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
    },
  );
  configurationInvariant(
    source || !outputs.length,
    "Workspace outputs require a workspace source",
    ["outputs"],
    "missing-field",
    "Declare a workspace source, or remove outputs.",
  );
  const { runtime: _runtime, outputs: _outputs, ...components } = configuration;
  return {
    configuration: { ...components, workspace: {}, sandbox },
    files: {
      plan,
      runtime,
      ...(source ? { source } : {}),
      ...(retention ? { retention } : {}),
      ...(paths ? { paths } : {}),
      ...(inputs ? { inputs } : {}),
      outputs,
    },
  };
}
