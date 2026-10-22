/** Module files the editor opens and creates for extensions. */
export const recipeEditorModuleTypes = [
  ".ts",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
] as const;

/** Contracts listed first because recipes select them most often. */
export const recipeEditorCommonContracts = [
  "call.options.perform",
  "loop.options.attempt",
  "loop.options.check",
  "hook.custom.run",
  "speculation.options.validate",
  "speculation.options.score",
  "artifactTask.options.produce",
] as const;

export const recipeEditorVerifyLimits = {
  deadlineMs: 120_000,
  retainBytes: 65_536,
} as const;

export const recipeEditorNamePatterns = {
  extension: /^[A-Za-z_][A-Za-z0-9_-]*$/,
  export: /^[A-Za-z_$][A-Za-z0-9_$]*$/,
} as const;
