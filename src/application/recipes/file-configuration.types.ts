import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
  WorkspaceRuntimeOptions,
} from "../../domain/file-workspace.types.ts";
import type { TransportReference } from "../../domain/transport.types.ts";
import type { ConfigurationDiagnostic } from "../../domain/configuration-diagnostic.types.ts";
import type {
  RecipeSandboxModel,
  RecipeWorkspaceDeclaration,
} from "./configuration-model.types.ts";
import type {
  FileWorkspaceBinding,
  SandboxProvider,
} from "../../domain/sandbox.types.ts";

export type RecipeWorkspaceInput =
  | { readonly directory: string; readonly paths?: readonly string[] }
  | { readonly snapshot: TransportReference; readonly transporter: string };

/** Static compatibility of a file workspace with its declared sandbox. */
export interface RecipeFileWorkspacePlan {
  readonly binding?: FileWorkspaceBinding;
  readonly sandbox: {
    /** Declared provider type, or the referenced component name. */
    readonly provider: string;
    /** Known for built-in providers; extension providers report theirs once created. */
    readonly placement?: SandboxProvider["placement"];
    readonly bindings?: readonly FileWorkspaceBinding[];
  };
  readonly diagnostics: readonly ConfigurationDiagnostic[];
}

/** A file workspace declaration, independent of the sandboxes that open it. */
export interface RecipeFileWorkspaceDeclaration {
  readonly retention?:
    | { readonly policy: "run" | "local" }
    | { readonly policy: "portable"; readonly transporter: string };
  readonly source?: FileWorkspaceSource;
  readonly paths?: readonly string[];
  readonly inputs?: readonly RecipeWorkspaceInput[];
  readonly outputs: readonly WorkspaceOutputOptions[];
}

export interface RecipeFileConfiguration extends RecipeFileWorkspaceDeclaration {
  readonly plan: RecipeFileWorkspacePlan;
  readonly runtime: WorkspaceRuntimeOptions;
}

export interface NormalizedRecipeConfiguration {
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly files?: RecipeFileConfiguration;
  readonly workspaces?: Readonly<Record<string, RecipeWorkspaceDeclaration>>;
  readonly sandboxes?: Readonly<Record<string, RecipeSandboxModel>>;
  /** Runtime of the file workspaces, when the configuration declares any. */
  readonly runtime?: WorkspaceRuntimeOptions;
}

export type RecipeConfigurationPath = readonly (string | number)[];

/** Publications of one file workspace: its own `outputs` or the configuration's. */
export interface RecipeWorkspaceOutputsDeclaration {
  readonly value: unknown;
  readonly path: RecipeConfigurationPath;
}

/** Named sandboxes split into component declarations and their workspace models. */
export interface RecipeNamedSandboxes {
  readonly declarations: Record<string, Readonly<Record<string, unknown>>>;
  readonly models: Record<string, RecipeSandboxModel>;
}
