import type {
  RecipeEditorSession,
  RecipeEditorState,
} from "./session.types.ts";

/** A callback or component contract an extension can implement. */
export interface RecipeEditorContract {
  readonly kind: string;
  readonly contract: string;
}

export interface RecipeEditorExtension {
  readonly name: string;
  readonly module: string;
  readonly export: string;
  readonly kind: string;
  readonly contract?: string;
  readonly version?: string;
  /** Module path relative to the editor directory; absent for packages and outside files. */
  readonly path?: string;
  readonly exists: boolean;
  /** `functions` entries that select this extension. */
  readonly functions: readonly string[];
}

export interface RecipeEditorExtensionRequest {
  readonly name: string;
  readonly kind: string;
  readonly contract?: string;
  /** Module path relative to the configuration, such as `./steps.ts`. */
  readonly module: string;
  readonly export: string;
  /** Also declares `functions.<name>` selecting the extension. */
  readonly function?: string;
  readonly revision: number;
}

export interface RecipeEditorExtensionCreation {
  readonly state: RecipeEditorState;
  readonly path: string;
  /** False when the module already existed and was only declared. */
  readonly created: boolean;
}

export interface RecipeEditorVerification {
  readonly ok: boolean;
  /** Extensions imported and checked by `recipe validate --extensions`. */
  readonly extensions: readonly string[];
  readonly message?: string;
}

export interface RecipeEditorVerifyOptions {
  readonly session: RecipeEditorSession;
  /** Command that starts the Outpost CLI, such as `[node, main.js]`. */
  readonly cli: readonly string[];
  readonly signal: AbortSignal;
}

/** Writes the starting module of a new extension. */
export type RecipeEditorScaffold = (
  exportName: string,
  request: RecipeEditorExtensionRequest,
) => string;
