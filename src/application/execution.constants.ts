export const executionDefaults = Object.freeze({
  passes: 1,
  idleMs: 600_000,
  idleWarningMs: 60_000,
  settleMs: 60_000,
  deadlineMs: 3_600_000,
  expansionMs: 30_000,
  attachMs: 86_400_000,
  completion: "<outpost>done</outpost>",
  rawTailBytes: 65_536,
  eventBytes: 16_777_216,
});

export const dispatchDeadlines = [
  "idleMs",
  "idleWarningMs",
  "settleMs",
  "deadlineMs",
  "expansionMs",
] as const;
