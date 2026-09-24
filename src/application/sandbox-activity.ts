import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";

export function trackedSandboxLease(
  lease: SandboxLease,
  activity: ResourceActivity,
): SandboxLease {
  const transfers = lease.fileTransfers;
  return {
    ...lease,
    invoke: (command) => activity.run("invoke", () => lease.invoke(command)),
    upload: (source, destination, options) =>
      activity.run("upload", () => lease.upload(source, destination, options)),
    download: (source, destination, options) =>
      activity.run("download", () =>
        lease.download(source, destination, options),
      ),
    release: lease.release.bind(lease),
    ...(transfers
      ? {
          fileTransfers: {
            ...transfers,
            manifest: (source, paths, options) =>
              activity.run("manifest", () =>
                transfers.manifest(source, paths, options),
              ),
            downloadBatch: (source, entries, destination, options) =>
              activity.run("download-batch", () =>
                transfers.downloadBatch(source, entries, destination, options),
              ),
          },
        }
      : {}),
  };
}
