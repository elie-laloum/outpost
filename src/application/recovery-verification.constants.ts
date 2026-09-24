export const recoveryVerificationDefaults = {
  maxStateBytes: 65_536,
  maxPaths: 1000,
} as const;

export const recoveryTransferPatches = [
  "remote.patch",
  "previous.patch",
  "previous-index.patch",
] as const;
