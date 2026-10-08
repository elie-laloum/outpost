export const recipeLimits = { bytes: 1_048_576, tasks: 1_000 } as const;
export const recipeKeys = {
  document: ["version", "name", "tasks"],
  documentV2: [
    "version",
    "name",
    "tasks",
    "description",
    "recipeVersion",
    "inputs",
    "$schema",
  ],
  input: ["type", "description", "default", "enum"],
  task: ["key", "after", "command", "agent", "brief", "timeoutMs", "retry"],
  taskV3: [
    "speculation",
    "queued",
    "key",
    "after",
    "command",
    "agent",
    "brief",
    "timeoutMs",
    "retry",
    "dispatch",
    "gate",
    "interactive",
    "artifact",
    "data",
    "quotaResume",
    "when",
    "value",
    "options",
    "call",
    "arguments",
    "loop",
    "decision",
    "state",
    "isolated",
  ],
  command: [
    "executable",
    "arguments",
    "stdin",
    "directory",
    "variables",
    "deadlineMs",
  ],
  retry: ["attempts", "delayMs"],
} as const;

export const recipeInputTypes = ["string", "number", "boolean"] as const;
export const recipeNamePattern = /^[A-Za-z_][A-Za-z0-9_-]*$/;
export const recipeTemplatePattern = /\{\{([\s\S]*?)\}\}/g;
export const recipeReferencePattern =
  /^(inputs|steps)\.([A-Za-z0-9_][A-Za-z0-9._-]*?)(?:\.(stdout|stderr|status|text))?$/;
export const recipeResultFields = {
  command: ["stdout", "stderr", "status"],
  agent: ["text"],
} as const;
