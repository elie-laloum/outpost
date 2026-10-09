import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
  WorkspaceRuntimeOptions,
} from "../../domain/file-workspace.types.ts";
import type { TransportReference } from "../../domain/transport.types.ts";

export type RecipeWorkspaceInput =
  | { readonly directory: string; readonly paths?: readonly string[] }
  | { readonly snapshot: TransportReference; readonly transporter: string };

export interface RecipeFileConfiguration {
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
