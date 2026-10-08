export const recipeConfigurationKeys = {
  root: [
    "version",
    "repository",
    "sandbox",
    "agents",
    "branch",
    "environment",
    "$schema",
  ],
  sandbox: ["provider", "image", "cpus", "memoryMb"],
  agent: ["harness", "authentication", "model"],
  model: ["name", "reasoning", "maxOutputTokens"],
  branch: ["mode", "name", "from"],
} as const;
