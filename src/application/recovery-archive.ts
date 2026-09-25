import { randomUUID } from "node:crypto";
import type { TransportReference } from "../domain/transport.types.ts";
import {
  archiveFiles,
  restoreArchiveFiles,
} from "../infrastructure/transport-archive.ts";
import { snapshotRecoveryTransfer } from "./recovery-restore-snapshot.ts";
import { recoveryChecksumPaths } from "./recovery-checksum-paths.ts";
import { recoveryChecksumDefaults } from "./recovery-checksums.constants.ts";
import { verifyRecoveryTransfer } from "./recovery-verification.ts";
import { invariant } from "../domain/errors.ts";
import type {
  RecoveryArchiveOptions,
  RecoveryArchiveRestoreOptions,
} from "./recovery-archive.types.ts";

export async function archiveRecovery(
  options: RecoveryArchiveOptions,
): Promise<TransportReference> {
  const snapshot = await snapshotRecoveryTransfer(
    options.directory,
    options.maxBytes,
  );
  try {
    return await archiveFiles(
      options.transporter,
      snapshot.directory,
      [
        ...recoveryChecksumPaths(snapshot.state),
        recoveryChecksumDefaults.filename,
      ],
      `recovery/${randomUUID()}`,
      options.maxBytes,
    );
  } finally {
    await snapshot.dispose();
  }
}

export async function materializeRecoveryArchive(
  options: RecoveryArchiveRestoreOptions,
): Promise<string> {
  await restoreArchiveFiles(
    options.transporter,
    options.reference,
    options.destination,
    options.maxBytes,
  );
  const verified = await verifyRecoveryTransfer(options.destination, {
    checksums: true,
    ...(options.maxBytes === undefined ? {} : { maxBytes: options.maxBytes }),
  });
  invariant(
    verified.complete && verified.integrity === "checksums-match",
    "Recovery archive integrity verification failed; destination retained",
  );
  return options.destination;
}
