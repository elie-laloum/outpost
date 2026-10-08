export const recipeLimits = { bytes: 1_048_576, tasks: 1_000 } as const;
export const recipeKeys = {
  document: ["version", "name", "tasks"],
  task: ["key", "after", "command", "agent", "brief", "timeoutMs", "retry"],
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
