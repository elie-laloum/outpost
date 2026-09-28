import { observedOperation } from "../domain/observed-operation.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
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

async function archiveRecoveryOperation(
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

async function materializeRecoveryOperation(
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

export function archiveRecovery(
  options: RecoveryArchiveOptions,
  observation?: ObservationHub,
): Promise<TransportReference> {
  return observedOperation(observation, "transfer", "recovery.archive", () =>
    archiveRecoveryOperation(options),
  );
}

export function materializeRecoveryArchive(
  options: RecoveryArchiveRestoreOptions,
  observation?: ObservationHub,
): Promise<string> {
  return observedOperation(
    observation,
    "transfer",
    "recovery.materialize",
    () => materializeRecoveryOperation(options),
  );
}
