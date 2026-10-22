import type { RecipeEditorOperation } from "../../domain/recipes/editor.types.ts";
import type { RecipeEditorRole, RecipeEditorSession } from "./session.types.ts";

export interface RecipeEditorRoutesOptions {
  readonly session: RecipeEditorSession;
  readonly version: string;
  readonly schemas?: {
    readonly recipe: string;
    readonly configuration: string;
  };
  /** Files named on the command line, proposed when the editor opens nothing yet. */
  readonly suggested?: { readonly recipe?: string; readonly config?: string };
  readonly diskPollMs?: number;
}

export interface RecipeEditorEditRequest {
  readonly role: RecipeEditorRole;
  readonly operations: readonly RecipeEditorOperation[];
  readonly revision: number;
}

export interface RecipeEditorTextRequest {
  readonly role: RecipeEditorRole;
  readonly text: string;
  readonly revision: number;
}

export interface RecipeEditorLayoutRequest {
  readonly layout: unknown;
  readonly revision: number;
}

export interface RecipeEditorRevisionRequest {
  readonly revision: number;
}

export interface RecipeEditorSaveRequest {
  readonly overwrite?: boolean;
}
