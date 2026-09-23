export const containerDefaults = Object.freeze({
  uid: 1000,
  gid: 1000,
  deadlineMs: 60_000,
  cleanupMs: 10_000,
  retainBytes: 65_536,
  root: "/workspace",
  home: "/home/agent",
  minimumMemoryMb: 64,
});
