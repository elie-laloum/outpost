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
  RecipeEditorLayoutNode,
  RecipeEditorNode,
  RecipeEditorOperation,
} from "../../../src/domain/recipes/editor.types.ts";
export type {
  RecipeEditorCompatibility,
  RecipeEditorEntity,
  RecipeEditorFeature,
  RecipeEditorPlacementItem,
  RecipeEditorPlacementTarget,
  RecipeEditorReference,
  RecipeEditorScene,
  RecipeEditorSceneOperation,
  RecipeEditorSceneTask,
  RecipeEditorZone,
} from "../../../src/domain/recipes/editor-scene.types.ts";
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
export type {
  RecipeEditorRun,
  RecipeEditorRunDetail,
  RecipeEditorRunEvent,
  RecipeEditorRunRequest,
} from "../../../src/application/recipe-editor/runs.types.ts";
export type { RecipeRunStatus } from "../../../src/application/recipes/durable.types.ts";
export type { RecipeReport } from "../../../src/application/recipe-report.types.ts";
export type { Observation } from "../../../src/domain/observation.types.ts";
export type {
  TaskRecord,
  TaskStatus,
} from "../../../src/domain/workflow.types.ts";
export type { WorkflowInputRequest } from "../../../src/domain/workflow/input.types.ts";
import type { inspectRecipeExecution } from "../../../src/application/recipes/plan.ts";
import type { RecipeEditorAction } from "../../../src/domain/recipes/editor.types.ts";
import type {
  RecipeEditorFeature,
  RecipeEditorZone,
} from "../../../src/domain/recipes/editor-scene.types.ts";

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

export type EditorView = "canvas" | "yaml" | "extensions" | "plan" | "runs";

/** Something the palette adds, by click or by drop on the canvas. */
export type PaletteItem =
  | { readonly type: "task"; readonly action: RecipeEditorAction }
  | {
      readonly type: "zone";
      readonly kind: RecipeEditorZone["kind"];
      /** Workspace kind or sandbox provider. */
      readonly value: string;
    }
  | { readonly type: "feature"; readonly feature: RecipeEditorFeature }
  | { readonly type: "component"; readonly family: string };

/** Optional canvas layers the toolbar shows or hides. */
export interface CanvasLayers {
  readonly components: boolean;
  readonly references: boolean;
}
