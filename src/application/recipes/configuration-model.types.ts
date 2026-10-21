import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { BranchPolicy } from "../../domain/workspace.types.ts";
import type { RecipeFileConfiguration } from "./file-configuration.types.ts";

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

/** Execution configuration shared by every document version after its read adapter. */
export interface RecipeConfigurationModel {
  readonly version: RecipeConfigurationVersion;
  /** Declarations resolved by the component graph, in the shape shared by versions 2 and 3. */
  readonly components: Readonly<Record<string, unknown>>;
  readonly workspace: RecipeGitWorkspaceModel | RecipeFileWorkspaceModel;
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
