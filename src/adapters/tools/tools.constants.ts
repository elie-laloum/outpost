export const TOOL_LIMITS = {
  readLines: 2_000,
  fileBytes: 4 * 1024 * 1024,
  binaryProbeBytes: 8_000,
  listEntries: 1_000,
  searchMatches: 200,
  commandCharacters: 200_000,
  shellDeadlineMs: 120_000,
} as const;

export const GIT_READ_COMMANDS = ["status", "diff", "log", "show"] as const;

export const GIT_BLOCKED_OPTIONS = [
  "--output",
  "--ext-diff",
  "--textconv",
  "--open-files-in-pager",
];
