export const storageReservationDefaults = {
  lockKey: "storage-reservations:v1",
  lockWaitMs: 5_000,
  lockPollMs: 20,
  maxRecordBytes: 4_096,
  maxRecords: 10_000,
} as const;
