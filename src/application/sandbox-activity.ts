import type { FileTransfers, SandboxLease } from "../domain/sandbox.types.ts";
import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";

export function trackedSandboxLease(
  lease: SandboxLease,
  activity: ResourceActivity,
): SandboxLease {
  const transfers = lease.fileTransfers;
  const upload = transfers?.uploadBatch?.bind(transfers);
  const uploadBatch: FileTransfers["uploadBatch"] = upload
    ? (...args) => activity.run("upload-batch", () => upload(...args))
    : undefined;
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
            ...(uploadBatch ? { uploadBatch } : {}),
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
