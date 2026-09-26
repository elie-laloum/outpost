export const HARNESS_DEFAULTS = {
  maxSteps: 100,
  concurrency: 4,
  toolDeadlineMs: 300_000,
  onError: "return-to-model",
  cache: true,
} as const;

export const HARNESS_FIELDS: ReadonlySet<string> = new Set([
  "modelProvider",
  "instructions",
  "tools",
  "limits",
  "toolExecution",
  "hooks",
  "permissions",
  "context",
  "conversations",
  "cache",
]);

export const TOOL_RESULT_CHARACTERS = 100_000;

export const TOOL_PREVIEW_CHARACTERS = 2_000;

export const USAGE_FIELDS = ["input", "cached", "cacheCreated", "output"];
