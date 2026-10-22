import type {
  RecipeEditorGraph,
  RecipeEditorLayout,
  RecipeEditorOperation,
} from "../../domain/recipes/editor.types.ts";
import type { RecipeSourcePath } from "../../domain/recipes/expressions.types.ts";
import type { RecipeEditorSceneOperation } from "../../domain/recipes/editor-scene.types.ts";
import type { EditorRoot } from "../../infrastructure/editor-files.types.ts";
import type { EditableYaml } from "../../infrastructure/recipes/editor-document.types.ts";
import type { RecipeRegistry } from "../../domain/recipes/component.types.ts";
import type { recipeEditorStarters } from "./starters.constants.ts";

export type RecipeEditorRole = "recipe" | "config";

export type RecipeEditorStarter = keyof typeof recipeEditorStarters;

export interface RecipeEditorDiagnostic {
  readonly file: RecipeEditorRole | "layout";
  readonly code: string;
  readonly message: string;
  readonly hint?: string;
  readonly path: RecipeSourcePath;
  readonly line?: number;
  readonly column?: number;
}

export interface RecipeEditorDraftState {
  /** Path relative to the editor directory. */
  readonly path: string;
  readonly text: string;
  /** The draft differs from the file opened or last saved. */
  readonly dirty: boolean;
  readonly exists: boolean;
  /** The file changed on disk while this draft had unsaved edits. */
  readonly changedOnDisk: boolean;
  /** Parsed YAML value; absent while the text is not valid YAML. */
  readonly value?: unknown;
  readonly version?: unknown;
}

export interface RecipeEditorState {
  readonly revision: number;
  readonly directory: string;
  readonly recipe?: RecipeEditorDraftState & {
    readonly graph: RecipeEditorGraph;
  };
  readonly config?: RecipeEditorDraftState;
  readonly layout: RecipeEditorLayout;
  readonly layoutDirty: boolean;
  /** Structured edits require recipe format 3 and configuration version 3. */
  readonly editable: { readonly recipe: boolean; readonly config: boolean };
  readonly diagnostics: readonly RecipeEditorDiagnostic[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export interface RecipeEditorOpenOptions {
  readonly recipe: string;
  readonly config?: string;
  /** Fills missing files with a starter draft instead of refusing them. */
  readonly starter?: RecipeEditorStarter;
}

export interface RecipeEditorSessionOptions {
  readonly root: EditorRoot;
  /** Package schema files referenced from new drafts for editor completion. */
  readonly schemas?: {
    readonly recipe: string;
    readonly configuration: string;
  };
  readonly registry?: RecipeRegistry;
}

export interface RecipeEditorSession {
  readonly root: EditorRoot;
  state(): RecipeEditorState;
  open(options: RecipeEditorOpenOptions): Promise<RecipeEditorState>;
  edit(
    role: RecipeEditorRole,
    operations: readonly RecipeEditorOperation[],
    revision: number,
  ): Promise<RecipeEditorState>;
  /** Applies canvas edits to the recipe and configuration together, as one undo step. */
  editScene(
    operations: readonly RecipeEditorSceneOperation[],
    revision: number,
  ): Promise<RecipeEditorState>;
  replaceText(
    role: RecipeEditorRole,
    text: string,
    revision: number,
  ): Promise<RecipeEditorState>;
  setLayout(
    layout: RecipeEditorLayout,
    revision: number,
  ): Promise<RecipeEditorState>;
  undo(revision: number): Promise<RecipeEditorState>;
  redo(revision: number): Promise<RecipeEditorState>;
  save(options?: { readonly overwrite?: boolean }): Promise<RecipeEditorState>;
  reload(): Promise<RecipeEditorState>;
  /** Reloads clean drafts changed on disk and flags dirty ones; returns whether state changed. */
  checkDisk(): Promise<boolean>;
  plan(): Promise<unknown>;
  /** Paths of the opened recipe and configuration, for commands run on saved files. */
  files(): { readonly recipe?: string; readonly config?: string };
  subscribe(listener: (state: RecipeEditorState) => void): () => void;
}

/** Internal draft of one YAML file. */
export interface RecipeEditorDraft {
  readonly path: string;
  /** Hash of the file as last read or written; null while it does not exist. */
  base: string | null;
  text: string;
  saved: string | undefined;
  editable: EditableYaml | undefined;
  parseError: string | undefined;
  changedOnDisk: boolean;
}

export interface RecipeEditorSnapshot {
  readonly recipe?: string;
  readonly config?: string;
  readonly layout: RecipeEditorLayout;
}

export interface RecipeEditorProject {
  readonly selection: RecipeEditorOpenOptions;
  readonly recipe: RecipeEditorDraft;
}
