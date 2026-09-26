import { reserveTransportStorage } from "../infrastructure/transport-reservations.ts";
import { directory } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { repositoryTransport } from "../infrastructure/repository-transport.ts";
import { storageInventory } from "../infrastructure/storage-inventory.ts";
import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
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
  if (options.transporter)
    return reserveTransportStorage(options.transporter, root, options);
  return reserveTransportStorage(
    repositoryTransport(root),
    root,
    options,
    async () => {
      const inventory = await storageInventory(
        join(root, ".outpost"),
        options.maxEntries,
      );
      invariant(
        inventory.complete,
        "Outpost storage reservation admission refused: incomplete inventory",
      );
      return inventory.usage.bytes;
    },
  );
}
