import type { RecipeSourcePath } from "./expressions.types.ts";
import type { RecipeEditorEdge, RecipeEditorNode } from "./editor.types.ts";
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
