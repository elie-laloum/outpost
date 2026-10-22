/** Configuration keys of the sandbox that runs a task and of the workspace it opens. */
export interface RecipeTaskZone {
  /** `workspace` or `workspaces.<name>`. */
  readonly workspace: string;
  /** `sandbox` or `sandboxes.<name>`. */
  readonly sandbox: string;
}

/** Workspace kind that opens, settles and reports a zone. */
export type RecipeZoneKindName = "git" | "files";
