export const recipeCatalogLimits = {
  entries: 1000,
  bytes: 1_048_576,
  timeoutMs: 15_000,
  redirects: 5,
} as const;
export const recipeCatalogFields = [
  "name",
  "version",
  "description",
  "source",
  "sha256",
] as const;
