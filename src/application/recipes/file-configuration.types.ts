import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
  WorkspaceRuntimeOptions,
} from "../../domain/file-workspace.types.ts";
import type { TransportReference } from "../../domain/transport.types.ts";
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
  readonly diagnostics: readonly string[];
}

export interface RecipeFileConfiguration {
  readonly plan: RecipeFileWorkspacePlan;
  readonly retention?:
    | { readonly policy: "run" | "local" }
    | { readonly policy: "portable"; readonly transporter: string };
  readonly runtime: WorkspaceRuntimeOptions;
  readonly source?: FileWorkspaceSource;
  readonly paths?: readonly string[];
  readonly inputs?: readonly RecipeWorkspaceInput[];
  readonly outputs: readonly WorkspaceOutputOptions[];
}

export interface NormalizedRecipeConfiguration {
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly files?: RecipeFileConfiguration;
}
