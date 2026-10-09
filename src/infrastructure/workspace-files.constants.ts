export const workspaceFileLimits = {
  entries: 100_000,
  bytes: 1024 * 1024 * 1024,
  manifestBytes: 16 * 1024 * 1024,
} as const;

export const workspaceExcludedNames = new Set([".git", ".outpost"]);
