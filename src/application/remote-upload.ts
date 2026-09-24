import { posix } from "node:path";
import type { SandboxLease, TransferOptions } from "../domain/sandbox.types.ts";
import { fileManifest } from "../infrastructure/file-manifest.ts";
import { safeDestination } from "../infrastructure/files.ts";

export async function uploadFiles(
  lease: SandboxLease,
  source: string,
  paths: readonly string[],
  options: TransferOptions = {},
): Promise<void> {
  if (lease.fileTransfers?.uploadBatch) {
    const entries = [];
    for (const path of paths) {
      options.signal?.throwIfAborted();
      entries.push(await fileManifest(source, path, options.signal));
    }
    await lease.fileTransfers.uploadBatch(source, entries, lease.root, options);
    return;
  }
  for (const path of paths)
    await lease.upload(
      await safeDestination(source, path),
      posix.join(lease.root, path),
      options,
    );
}
