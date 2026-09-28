import type { ObservationHub } from "../domain/observation.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { observedOperation } from "../domain/observed-operation.ts";

export function observedLease(
  lease: SandboxLease,
  observation?: ObservationHub,
): SandboxLease {
  if (!observation) return lease;
  return {
    ...lease,
    invoke: lease.invoke.bind(lease),
    ...(lease.fileTransfers
      ? {
          fileTransfers: {
            manifest: (source, paths, options) =>
              observedOperation(observation, "transfer", "files.manifest", () =>
                lease.fileTransfers!.manifest(source, paths, options),
              ),
            downloadBatch: (source, entries, destination, options) =>
              observedOperation(observation, "transfer", "files.download", () =>
                lease.fileTransfers!.downloadBatch(
                  source,
                  entries,
                  destination,
                  options,
                ),
              ),
            ...(lease.fileTransfers.uploadBatch
              ? {
                  uploadBatch: (
                    source: string,
                    entries: readonly import("../domain/sandbox.types.ts").FileManifestEntry[],
                    destination: string,
                    options?: import("../domain/sandbox.types.ts").TransferOptions,
                  ) =>
                    observedOperation(
                      observation,
                      "transfer",
                      "files.upload",
                      () =>
                        lease.fileTransfers!.uploadBatch!(
                          source,
                          entries,
                          destination,
                          options,
                        ),
                    ),
                }
              : {}),
          },
        }
      : {}),
    upload: (source, destination, settings) =>
      observedOperation(observation, "transfer", "file.upload", () =>
        lease.upload(source, destination, settings),
      ),
    download: (source, destination, settings) =>
      observedOperation(observation, "transfer", "file.download", () =>
        lease.download(source, destination, settings),
      ),
    release: () =>
      observedOperation(observation, "sandbox", "sandbox.release", () =>
        lease.release(),
      ),
  };
}
