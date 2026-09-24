export const storageMutationLockDefaults = {
  lockKey: "storage-reservations:v1",
  lockWaitMs: 5_000,
  lockPollMs: 20,
} as const;
