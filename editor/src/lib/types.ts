export type {
  RecipeEditorDiagnostic,
  RecipeEditorDraftState,
  RecipeEditorRole,
  RecipeEditorState,
} from "../../../src/application/recipe-editor/session.types.ts";
export type {
  RecipeEditorFiles,
  RecipeEditorSessionInfo,
} from "../../../src/application/recipe-editor/routes.types.ts";
export type {
  RecipeEditorAction,
  RecipeEditorEdge,
  RecipeEditorGraph,
  RecipeEditorLayout,
  RecipeEditorNode,
  RecipeEditorOperation,
} from "../../../src/domain/recipes/editor.types.ts";
export type {
  EditorDirectoryEntry,
  EditorFile,
} from "../../../src/infrastructure/editor-files.types.ts";
export type {
  RecipeEditorContract,
  RecipeEditorExtension,
  RecipeEditorExtensionCreation,
  RecipeEditorVerification,
} from "../../../src/application/recipe-editor/extensions.types.ts";
import type { inspectRecipeExecution } from "../../../src/application/recipes/plan.ts";

/** Static execution plan of the drafts, as `outpost recipe plan --json` reports it. */
export type RecipePlan = Awaited<ReturnType<typeof inspectRecipeExecution>>;

export type Position = { readonly x: number; readonly y: number };

/** A rejected API request, with the located diagnostic when the server gave one. */
export interface EditorFailure {
  readonly status: number;
  readonly message: string;
  readonly code?: string;
  readonly diagnostic?: {
    readonly code: string;
    readonly path: readonly (string | number)[];
    readonly hint?: string;
  };
  readonly details?: { readonly files?: readonly string[] };
}

/** Names the configuration declares, offered by task forms and templates. */
export interface ConfigurationNames {
  readonly agents: readonly string[];
  readonly functions: readonly string[];
}

export type EditorView = "canvas" | "yaml" | "config" | "plan";
