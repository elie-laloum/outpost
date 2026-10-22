import type { RecipeSourcePath } from "./expressions.types.ts";
import type {
  DocumentMutation,
  RecipeEditorEdge,
  RecipeEditorLayout,
  RecipeEditorNode,
} from "./editor.types.ts";
import type { recipeEditorFeatures } from "./editor-scene.constants.ts";

export type RecipeEditorFeature = keyof typeof recipeEditorFeatures;

export type RecipeEditorWorkspaceMode = "git" | "files";

/** A workspace or sandbox of the configuration, drawn as a zone that contains its sandboxes or tasks. */
export interface RecipeEditorZone {
  /** `workspace`, `workspaces.<name>`, `sandbox` or `sandboxes.<name>`. */
  readonly id: string;
  readonly kind: "workspace" | "sandbox";
  /** Name under `workspaces` or `sandboxes`; absent for the configuration pair. */
  readonly name?: string;
  /** Workspace zone that a sandbox zone opens. */
  readonly parent?: string;
  /** Workspace kind such as `git` or `ephemeral`, or the sandbox provider type. */
  readonly type?: string;
  readonly mode?: RecipeEditorWorkspaceMode;
  /** Configuration path of the declaration. */
  readonly path: RecipeSourcePath;
  readonly features: readonly RecipeEditorFeature[];
  /** False when tasks use the configuration pair without declaring it. */
  readonly declared: boolean;
}

/** A named configuration component, such as `agents.coder` or `stores.checkpoint`. */
export interface RecipeEditorEntity {
  readonly id: string;
  readonly family: string;
  readonly name: string;
  /** Component kind that `$ref` fields expect, such as `agent`. */
  readonly kind: string;
  readonly type?: string;
}

export interface RecipeEditorSceneTask extends RecipeEditorNode {
  /** Sandbox zone of a command or agent task; absent for tasks outside zones. */
  readonly zone?: string;
}

/** Scene node identity, prefixed by its family so tasks, zones and entities never collide. */
export type RecipeEditorSceneId =
  `task:${string}` | `zone:${string}` | `entity:${string}` | "run";

/** A `$ref`, or an agent task's role name, from a declaration to an entity. */
export interface RecipeEditorReference {
  readonly source: RecipeEditorSceneId;
  readonly target: string;
  /** Dotted path of the referencing field inside the source declaration. */
  readonly field: string;
}

export interface RecipeEditorScene {
  readonly tasks: readonly RecipeEditorSceneTask[];
  readonly edges: readonly RecipeEditorEdge[];
  readonly zones: readonly RecipeEditorZone[];
  readonly entities: readonly RecipeEditorEntity[];
  readonly references: readonly RecipeEditorReference[];
  /** Recipe workflow options and the declared environment names. */
  readonly run: {
    readonly options: readonly string[];
    readonly environment: readonly string[];
  };
}

/** What the configuration accepts where, derived from the component registry. */
export interface RecipeEditorCompatibility {
  /** Features each sandbox provider type accepts. */
  readonly providers: Readonly<Record<string, readonly RecipeEditorFeature[]>>;
  /** Component kind and registered types of each configuration family. */
  readonly families: Readonly<
    Record<string, { readonly kind: string; readonly types: readonly string[] }>
  >;
}

export type RecipeEditorPlacementItem =
  | { readonly type: "task"; readonly id: string }
  | { readonly type: "zone"; readonly id: string }
  | { readonly type: "feature"; readonly feature: RecipeEditorFeature };

export type RecipeEditorPlacementTarget =
  { readonly type: "root" } | { readonly type: "zone"; readonly id: string };

export type RecipeEditorPlacement =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string };

export interface RecipeEditorFeatureDeclaration {
  readonly zone: RecipeEditorZone["kind"];
  /** Workspace modes that accept the feature; sandbox features depend on the provider. */
  readonly modes?: readonly RecipeEditorWorkspaceMode[];
}

/** One placement rule per dragged item type. */
export type RecipeEditorPlacers = {
  readonly [Type in RecipeEditorPlacementItem["type"]]: (
    scene: RecipeEditorScene,
    compatibility: RecipeEditorCompatibility,
    item: Extract<RecipeEditorPlacementItem, { type: Type }>,
    target: RecipeEditorZone | undefined,
  ) => RecipeEditorPlacement;
};

/** A canvas edit that may change the recipe and its configuration together. */
export type RecipeEditorSceneOperation =
  | { readonly type: "place-task"; readonly key: string; readonly zone: string }
  | {
      readonly type: "place-sandbox";
      readonly sandbox: string;
      readonly workspace: string;
    }
  | {
      readonly type: "add-zone";
      readonly kind: RecipeEditorZone["kind"];
      /** Omitted to declare the configuration `workspace` or `sandbox`. */
      readonly name?: string;
      readonly declaration: Readonly<Record<string, unknown>>;
      /** Workspace zone a new named sandbox opens. */
      readonly workspace?: string;
    }
  | { readonly type: "remove-zone"; readonly zone: string }
  | { readonly type: "rename-zone"; readonly zone: string; readonly to: string }
  | {
      readonly type: "set-feature";
      readonly zone: string;
      readonly feature: RecipeEditorFeature;
      /** Omitted to remove the feature. */
      readonly value?: unknown;
    }
  | {
      readonly type: "add-entity";
      readonly family: string;
      readonly name: string;
      readonly declaration: unknown;
    }
  | { readonly type: "remove-entity"; readonly entity: string }
  | {
      readonly type: "rename-entity";
      readonly entity: string;
      readonly to: string;
    }
  | {
      /** Moves an inline component to a named configuration entity referenced in its place. */
      readonly type: "extract";
      readonly role: "recipe" | "config";
      readonly path: RecipeSourcePath;
      readonly family: string;
      readonly name: string;
    };

export interface RecipeEditorSceneDocuments {
  readonly recipe: unknown;
  readonly config: unknown;
}

export interface RecipeEditorSceneMutations {
  readonly recipe: readonly DocumentMutation[];
  readonly config: readonly DocumentMutation[];
}

/** One planner per scene operation type. */
export type RecipeEditorScenePlanners = {
  readonly [Type in RecipeEditorSceneOperation["type"]]: (
    documents: RecipeEditorSceneDocuments,
    operation: Extract<RecipeEditorSceneOperation, { type: Type }>,
    compatibility: RecipeEditorCompatibility,
  ) => RecipeEditorSceneMutations;
};

/** Layout changes that follow zone and entity renames or removals. */
export type RecipeEditorSceneLayoutUpdates = {
  readonly [Type in RecipeEditorSceneOperation["type"]]?: (
    layout: RecipeEditorLayout,
    operation: Extract<RecipeEditorSceneOperation, { type: Type }>,
  ) => RecipeEditorLayout;
};
