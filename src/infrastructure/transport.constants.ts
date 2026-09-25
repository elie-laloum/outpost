export const transportDefaults = Object.freeze({
  maxBytes: 64 * 1024 * 1024,
  headerBytes: 1024,
  lockMs: 30_000,
  retryMs: 10,
  maxEntries: 100_000,
  mutationAttempts: 100,
});
