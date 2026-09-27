export const firecrackerJailerLimits = {
  cgroupRoot: "/sys/fs/cgroup",
  cgroupFilesystem: 0x63677270,
  cpuPeriodUs: 100_000,
  minimumCpuQuotaUs: 1000,
  minimumProcesses: 16,
  maximumIdentity: 4_294_967_294,
  bytesPerMiB: 1024 * 1024,
} as const;
