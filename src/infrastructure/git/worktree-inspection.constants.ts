export const worktreeInspectionDefaults = {
  deadlineMs: 10_000,
  retainBytes: 1_048_576,
} as const;

export const worktreeInspectionArguments = [
  "--no-optional-locks",
  "-c",
  "core.fsmonitor=false",
  "-c",
  "core.hooksPath=" + (process.platform === "win32" ? "NUL" : "/dev/null"),
  "-c",
  "maintenance.auto=false",
  "-c",
  "gc.auto=0",
] as const;
