export const processDefaults = Object.freeze({
  deadlineMs: 600_000,
  retainBytes: 65_536,
  killGraceMs: 500,
});
export const outputChannels = ["stdout", "stderr"] as const;
