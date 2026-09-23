export const gitDefaults = Object.freeze({
  deadlineMs: 30_000,
  retainBytes: 16_777_216,
  hashLength: 12,
  labelLength: 48,
});
export const runtimeExclusions = [
  "/.outpost/workspaces/",
  "/.outpost/locks/",
  "/.outpost/recovery/",
  "/.outpost/logs/",
] as const;
