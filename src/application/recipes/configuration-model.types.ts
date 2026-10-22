import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { BranchPolicy } from "../../domain/workspace.types.ts";
import type {
  RecipeFileConfiguration,
  RecipeFileWorkspaceDeclaration,
  RecipeFileWorkspacePlan,
} from "./file-configuration.types.ts";

export type RecipeConfigurationVersion = 1 | 2 | 3;

export interface RecipeGitWorkspaceModel {
  readonly kind: "git";
  readonly repository: string;
  readonly branch: BranchPolicy;
}

export interface RecipeFileWorkspaceModel {
  readonly kind: "files";
  readonly files: RecipeFileConfiguration;
}

/** A workspace declared under `workspaces`, opened by the sandboxes that name it. */
export type RecipeWorkspaceDeclaration =
  | RecipeGitWorkspaceModel
  | { readonly kind: "files"; readonly files: RecipeFileWorkspaceDeclaration };

/** A sandbox declared under `sandboxes`; tasks select it with `sandbox: <name>`. */
export interface RecipeSandboxModel {
  /** Named workspace the sandbox opens; the configuration `workspace` when absent. */
  readonly workspace?: string;
  /** Static compatibility with a file workspace, known before allocation. */
  readonly plan?: RecipeFileWorkspacePlan;
}

/** Execution configuration shared by every document version after its read adapter. */
export interface RecipeConfigurationModel {
  readonly version: RecipeConfigurationVersion;
  /** Declarations resolved by the component graph, in the shape shared by versions 2 and 3. */
  readonly components: Readonly<Record<string, unknown>>;
  readonly workspace: RecipeGitWorkspaceModel | RecipeFileWorkspaceModel;
  /** Workspaces declared beside the default `workspace`, in the same mode. */
  readonly workspaces: Readonly<Record<string, RecipeWorkspaceDeclaration>>;
  readonly sandboxes: Readonly<Record<string, RecipeSandboxModel>>;
  /** Agent roles that recipe tasks may reference. */
  readonly agents: readonly string[];
  /** Sandbox variable names mapped to the host variables read at execution. */
  readonly environment: Readonly<Record<string, string>>;
}

export type RecipeConfigurationReader = (
  record: Readonly<Record<string, unknown>>,
  file: string,
  document: RecipeDocument,
) => Promise<RecipeConfigurationModel>;
