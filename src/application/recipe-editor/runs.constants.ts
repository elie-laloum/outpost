export const recipeEditorRunDefaults = {
  /** History directory relative to the editor directory; it ignores itself in Git. */
  directory: ".outpost/editor/runs",
  pollMs: 200,
  historyLimit: 50,
  detailEvents: 2_000,
  detailBytes: 4 * 1024 * 1024,
  stderrBytes: 65_536,
  reportBytes: 16 * 1024 * 1024,
  closeGraceMs: 10_000,
  statusDeadlineMs: 60_000,
} as const;
