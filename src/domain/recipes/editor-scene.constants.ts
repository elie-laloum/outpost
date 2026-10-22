import type {
  RecipeEditorFeatureDeclaration,
  RecipeEditorWorkspaceMode,
} from "./editor-scene.types.ts";

/** Zone settings drawn as removable features; their key is also their configuration field. */
export const recipeEditorFeatures = {
  branch: { zone: "workspace", modes: ["git"] },
  inputs: { zone: "workspace", modes: ["files"] },
  outputs: { zone: "workspace", modes: ["files"] },
  retention: { zone: "workspace", modes: ["files"] },
  variables: { zone: "sandbox" },
  egress: { zone: "sandbox" },
  caches: { zone: "sandbox" },
  volumes: { zone: "sandbox" },
} as const satisfies Readonly<Record<string, RecipeEditorFeatureDeclaration>>;

export const recipeEditorWorkspaceModes: Readonly<
  Record<string, RecipeEditorWorkspaceMode>
> = { git: "git", ephemeral: "files", directory: "files" };

/** Only these tasks run in the sandbox a zone opens. */
export const recipeEditorSandboxActions = ["command", "agent"] as const;
