import type { recipeActions } from "./actions.constants.ts";
import type { RecipeSourcePath } from "./expressions.types.ts";

export type RecipeEditorAction = (typeof recipeActions)[number];

/** One task of a draft recipe, projected even when the draft is invalid. */
export interface RecipeEditorNode {
  /** Unique node identity: the task key, or `#<index>` for a missing or duplicate key. */
  readonly id: string;
  readonly key?: string;
  readonly index: number;
  /** Absent when the task declares no operation or several operations. */
  readonly action?: RecipeEditorAction;
  readonly actions: readonly RecipeEditorAction[];
  readonly summary: string;
  readonly conditional: boolean;
  /** Configuration components selected with `$ref`, such as `functions.summary`. */
  readonly components: readonly string[];
}

export interface RecipeEditorEdge {
  readonly source: string;
  readonly target: string;
  /** `after` orders tasks; `data` marks a `$step` or `{{ steps.* }}` read. */
  readonly kind: "after" | "data";
}

export interface RecipeEditorGraph {
  readonly nodes: readonly RecipeEditorNode[];
  readonly edges: readonly RecipeEditorEdge[];
}

export type RecipeEditorOperation =
  | {
      readonly type: "add-task";
      readonly task: Readonly<Record<string, unknown>>;
      readonly index?: number;
    }
  | { readonly type: "remove-task"; readonly key: string }
  | { readonly type: "rename-task"; readonly key: string; readonly to: string }
  | { readonly type: "move-task"; readonly key: string; readonly index: number }
  | {
      readonly type: "connect";
      readonly source: string;
      readonly target: string;
    }
  | {
      readonly type: "disconnect";
      readonly source: string;
      readonly target: string;
    }
  | {
      readonly type: "set";
      readonly path: RecipeSourcePath;
      /** Omitted to delete the value at `path`. */
      readonly value?: unknown;
    };

/** A located change applied to a YAML document without reformatting untouched nodes. */
export type DocumentMutation =
  | {
      readonly op: "set";
      readonly path: RecipeSourcePath;
      readonly value: unknown;
      readonly flow?: boolean;
    }
  | { readonly op: "delete"; readonly path: RecipeSourcePath }
  | {
      readonly op: "insert";
      readonly path: RecipeSourcePath;
      readonly index: number;
      readonly value: unknown;
      readonly flow?: boolean;
    }
  | {
      readonly op: "move";
      readonly path: RecipeSourcePath;
      readonly from: number;
      readonly to: number;
    }
  /** Renames the map key at the end of `path`, keeping its value, comments and position. */
  | {
      readonly op: "rename";
      readonly path: RecipeSourcePath;
      readonly to: string;
    };

export interface RecipeEditorLayoutNode {
  readonly x: number;
  readonly y: number;
  /** Size of a zone the user resized. */
  readonly width?: number;
  readonly height?: number;
  readonly collapsed?: boolean;
}

/** Canvas layout saved beside a recipe in `<name>.editor.json`; version 1 files are read as task positions. */
export interface RecipeEditorLayout {
  readonly version: 2;
  /** Keyed by scene id (`task:<key>`, `zone:<id>`, `entity:<id>`, `run`); nodes inside a zone are relative to it. */
  readonly nodes: Readonly<Record<string, RecipeEditorLayoutNode>>;
}

export type RecipeEditorPlanner = (
  document: unknown,
  operation: RecipeEditorOperation,
) => readonly DocumentMutation[];

/** One planner per operation type, so each edit rule has a single owner. */
export type RecipeEditorPlanners = {
  readonly [Type in RecipeEditorOperation["type"]]: (
    document: unknown,
    operation: Extract<RecipeEditorOperation, { type: Type }>,
  ) => readonly DocumentMutation[];
};

export interface RecipeTaskRename {
  readonly from: string;
  readonly to: string;
  /** Every task key, used to resolve dotted `{{ steps.* }}` references. */
  readonly keys: readonly string[];
}
