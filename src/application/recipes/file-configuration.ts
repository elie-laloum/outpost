import { resolve } from "node:path";
import { invariant } from "../../domain/errors.ts";
import { recipeRecord } from "../../domain/recipes/values.ts";
import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
} from "../../domain/file-workspace.types.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import { validateWorkspaceSelection } from "../../infrastructure/workspace-files.ts";
import type { NormalizedRecipeConfiguration } from "./file-configuration.types.ts";
import type { RecipeFileConfiguration } from "./file-configuration.types.ts";
import { transportReference } from "../../infrastructure/transport-json.ts";

function onlyKeys(
  value: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  label: string,
): void {
  for (const key of Object.keys(value))
    invariant(allowed.includes(key), `Unsupported ${label} field: ${key}`);
}

function stringPaths(value: unknown): readonly string[] {
  invariant(
    Array.isArray(value) &&
      value.every((path: unknown) => typeof path === "string"),
    "Workspace paths must be strings",
  );
  validateWorkspaceSelection(value);
  return value;
}

export function normalizeRecipeWorkspaceConfiguration(
  configuration: Readonly<Record<string, unknown>>,
  directory: string,
  document: RecipeDocument,
): NormalizedRecipeConfiguration {
  if (configuration.version !== 3) return { configuration };
  invariant(
    configuration.repository === undefined &&
      configuration.branch === undefined,
    "Configuration 3 declares Git options inside workspace",
  );
  const workspace =
    configuration.workspace === undefined
      ? undefined
      : recipeRecord(configuration.workspace, "workspace");
  if (workspace?.kind === "git") {
    invariant(
      configuration.runtime === undefined &&
        configuration.outputs === undefined,
      "Git configuration retains repository control storage and integration; file runtime and outputs require a file workspace",
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
      "workspace",
    );
    const { kind: _kind, repository, branch, ...options } = workspace;
    invariant(
      typeof repository === "string",
      "Git workspace requires repository",
    );
    return {
      configuration: {
        ...configuration,
        version: 2,
        repository,
        ...(branch ? { branch } : {}),
        workspace: options,
      },
    };
  }
  invariant(
    configuration.integration === undefined,
    "Git integration is unavailable for file workspaces",
  );
  for (const step of document.tasks)
    invariant(
      !step.speculation,
      "Git speculation is unavailable for file workspaces",
    );
  for (const step of document.tasks)
    if (step.brief !== undefined)
      invariant(
        !/\{\{\s*(WORK_BRANCH|BASE_BRANCH)\s*\}\}/.test(step.brief),
        "Git branch variables are unavailable in file workspaces",
      );
  const runtimeDeclaration = recipeRecord(
    configuration.runtime ?? {},
    "runtime",
  );
  onlyKeys(runtimeDeclaration, ["directory", "namespace"], "runtime");
  invariant(
    runtimeDeclaration.directory === undefined ||
      typeof runtimeDeclaration.directory === "string",
    "Runtime directory must be a string",
  );
  invariant(
    runtimeDeclaration.namespace === undefined ||
      typeof runtimeDeclaration.namespace === "string",
    "Runtime namespace must be a string",
  );
  const runtime = {
    directory: resolve(directory, runtimeDeclaration.directory ?? ".outpost"),
    ...(runtimeDeclaration.namespace
      ? { namespace: runtimeDeclaration.namespace }
      : {}),
  };
  invariant(
    runtimeDeclaration.namespace === undefined ||
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(runtimeDeclaration.namespace),
    "Invalid runtime namespace",
  );
  let source: FileWorkspaceSource | undefined;
  let retention: RecipeFileConfiguration["retention"];
  let paths: readonly string[] | undefined;
  let inputs: RecipeFileConfiguration["inputs"];
  if (workspace) {
    onlyKeys(
      workspace,
      ["kind", "directory", "access", "paths", "retention", "inputs"],
      "workspace",
    );
    if (workspace.inputs !== undefined) {
      invariant(
        Array.isArray(workspace.inputs),
        "Workspace inputs must be a list",
      );
      inputs = workspace.inputs.map((value: unknown) => {
        const input = recipeRecord(value, "workspace.inputs");
        onlyKeys(
          input,
          ["directory", "paths", "snapshot", "transporter"],
          "workspace.inputs",
        );
        if (input.directory !== undefined) {
          invariant(
            typeof input.directory === "string" &&
              input.snapshot === undefined &&
              input.transporter === undefined,
            "Directory workspace inputs cannot declare snapshots",
          );
          return {
            directory: resolve(directory, input.directory),
            ...(input.paths === undefined
              ? {}
              : { paths: stringPaths(input.paths) }),
          };
        }
        const reference = recipeRecord(
          input.transporter,
          "workspace.inputs.transporter",
        );
        invariant(
          typeof reference.$ref === "string" && input.paths === undefined,
          "Snapshot input requires an explicit Transport reference",
        );
        return {
          snapshot: transportReference(input.snapshot),
          transporter: reference.$ref,
        };
      });
    }
    if (workspace.retention !== undefined) {
      const declaration = recipeRecord(
        workspace.retention,
        "workspace.retention",
      );
      onlyKeys(declaration, ["policy", "transporter"], "workspace.retention");
      invariant(
        declaration.policy === "run" ||
          declaration.policy === "local" ||
          declaration.policy === "portable",
        "Invalid workspace retention policy",
      );
      if (declaration.policy === "portable") {
        const reference = recipeRecord(
          declaration.transporter,
          "workspace.retention.transporter",
        );
        invariant(
          typeof reference.$ref === "string" && runtime.namespace,
          "Portable retention requires an explicit Transport reference and namespace",
        );
        retention = { policy: "portable", transporter: reference.$ref };
      }
      if (declaration.policy === "run" || declaration.policy === "local") {
        invariant(
          declaration.transporter === undefined,
          "Local retention cannot declare a Transport",
        );
        retention = { policy: declaration.policy };
      }
    }
    if (workspace.paths !== undefined) paths = stringPaths(workspace.paths);
    if (workspace.kind === "ephemeral") {
      invariant(
        workspace.directory === undefined &&
          workspace.access === undefined &&
          !paths,
        "Ephemeral workspace cannot declare directory inputs",
      );
      source = { kind: "ephemeral" };
    }
    if (workspace.kind === "directory") {
      invariant(
        typeof workspace.directory === "string",
        "Directory workspace requires directory",
      );
      const access =
        workspace.access === undefined || workspace.access === "copy"
          ? { mode: "copy" }
          : recipeRecord(workspace.access, "workspace.access");
      onlyKeys(access, ["mode", "target", "readOnly"], "workspace.access");
      if (access.mode === "copy") {
        invariant(
          access.target === undefined && access.readOnly === undefined,
          "Copy access cannot declare mount options",
        );
        source = {
          kind: "directory",
          directory: resolve(directory, workspace.directory),
          access: { mode: "copy" },
        };
      }
      if (access.mode === "mount") {
        invariant(
          typeof access.target === "string" &&
            typeof access.readOnly === "boolean" &&
            !paths,
          "Mount requires target and explicit readOnly, without paths",
        );
        validateWorkspaceSelection([access.target]);
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
    invariant(source, "Unsupported workspace kind or access mode");
  }
  const needsSandbox = document.tasks.some(
    (step) => step.command || step.agent,
  );
  invariant(
    !needsSandbox || (source && configuration.sandbox),
    "Sandbox tasks require an explicit workspace source and sandbox",
  );
  const sandbox = recipeRecord(
    configuration.sandbox ?? { provider: "local" },
    "sandbox",
  );
  if (
    source &&
    ["docker", "podman"].includes(String(sandbox.provider ?? sandbox.type))
  )
    invariant(
      typeof sandbox.image === "string" && !!sandbox.image,
      "File workspaces require an explicit container image",
    );
  if (source?.kind === "directory" && source.access.mode === "mount")
    invariant(
      !["local", "vercel", "daytona", "firecracker", "memory"].includes(
        String(sandbox.provider ?? sandbox.type),
      ) && sandbox.repositoryMode !== "isolated",
      "Sandbox provider cannot mount workspace sources",
    );
  invariant(
    configuration.outputs === undefined || Array.isArray(configuration.outputs),
    "Workspace outputs must be a list",
  );
  const outputs: WorkspaceOutputOptions[] = (configuration.outputs ?? []).map(
    (declaration: unknown) => {
      const output = recipeRecord(declaration, "outputs");
      onlyKeys(
        output,
        ["paths", "destination", "policy", "deleteMissing"],
        "outputs",
      );
      invariant(
        typeof output.destination === "string" &&
          (output.policy === "create" || output.policy === "update") &&
          (output.deleteMissing === undefined ||
            typeof output.deleteMissing === "boolean"),
        "Invalid workspace publication declaration",
      );
      return {
        paths: stringPaths(output.paths),
        destination: resolve(directory, output.destination),
        policy: output.policy,
        ...(output.deleteMissing === undefined
          ? {}
          : { deleteMissing: output.deleteMissing }),
      };
    },
  );
  invariant(
    source || !outputs.length,
    "Workspace outputs require a workspace source",
  );
  const { runtime: _runtime, outputs: _outputs, ...components } = configuration;
  return {
    configuration: { ...components, version: 2, workspace: {}, sandbox },
    files: {
      runtime,
      ...(source ? { source } : {}),
      ...(retention ? { retention } : {}),
      ...(paths ? { paths } : {}),
      ...(inputs ? { inputs } : {}),
      outputs,
    },
  };
}
