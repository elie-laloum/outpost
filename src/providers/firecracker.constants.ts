export const firecrackerDefaults = {
  root: "/workspace",
  cpus: 2,
  memoryMb: 2048,
  bootDeadlineMs: 60_000,
  commandMs: 600_000,
  probeMs: 2000,
  cleanupMs: 5000,
  manifestBytes: 16 * 1024 * 1024,
} as const;
