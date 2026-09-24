import { directory } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { reserveStorage } from "../infrastructure/storage-reservations.ts";
import type { StorageReservation } from "../infrastructure/storage-reservations.types.ts";
import type { RecoveryStorageReservationOptions } from "./storage-reservation.types.ts";

export async function reserveRecoveryStorage(
  options: RecoveryStorageReservationOptions,
): Promise<StorageReservation> {
  options.signal?.throwIfAborted();
  const requested = await directory(options.repository);
  const root = await directory(
    (await git(requested, ["rev-parse", "--show-toplevel"])).trim(),
  );
  return reserveStorage(root, options);
}
