export const runDefaults = {
  heartbeatMs: 5_000,
  abandonAfterMs: 30_000,
  pollMs: 1_000,
  maxBytes: 8 * 1024 * 1024,
};
export const runStatuses = [
  "running",
  "abandoned",
  "done",
  "failed",
  "cancelled",
  "paused",
  "waiting-input",
  "rejected",
] as const;
export const runTaskStatuses = [
  "waiting",
  "active",
  "done",
  "failed",
  "skipped",
  "cancelled",
  "paused",
  "waiting-input",
  "rejected",
] as const;
export const runDispatchStatuses = [
  "running",
  "done",
  "failed",
  "cancelled",
] as const;
