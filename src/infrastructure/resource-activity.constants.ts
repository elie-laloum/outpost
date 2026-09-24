export const resourceActivityDefaults = {
  directory: "resource-activity",
  maxRecords: 10_000,
  maxRecordBytes: 65_536,
  maxText: 4_096,
} as const;

export const resourcePhases = [
  "allocating",
  "ready",
  "closing",
  "cleanup-failed",
  "allocation-uncertain",
] as const;
export const resourceOperationKinds = [
  "dispatch",
  "attach",
  "diagnose",
  "command",
  "invoke",
  "upload",
  "download",
  "manifest",
  "download-batch",
  "upload-batch",
] as const;
