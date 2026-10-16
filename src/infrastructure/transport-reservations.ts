import { transportDefaults } from "./transport.constants.ts";
import { randomUUID } from "node:crypto";
import type { Transport } from "../domain/transport.types.ts";
import { TransportConflict } from "../domain/transport.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { jsonBytes, jsonObject } from "./transport-json.ts";
import type {
  StorageReservation,
  StorageReservationOptions,
} from "./storage-reservations.types.ts";
import { reservationLedger } from "./reservation-ledger.ts";
import { reservationLedgerKey as key } from "./transport-reservations.constants.ts";
import { localProcessIdentity } from "./git/process-identity.ts";
import { hostname } from "node:os";
export { reservationLedger } from "./reservation-ledger.ts";

const ownerId = randomUUID();

async function payloadUsage(
  transporter: Transport,
  maxEntries: number,
  signal?: AbortSignal,
): Promise<number> {
  let usage = 0,
    count = 0;
  for await (const entry of transporter.list("", signal ? { signal } : {})) {
    invariant(++count <= maxEntries, "Reservation inventory is incomplete");
    if (entry.key !== key) usage += entry.size;
  }
  return usage;
}

export async function reserveTransportStorage(
  transporter: Transport,
  repository: string,
  options: StorageReservationOptions,
  measureUsage?: () => Promise<number>,
): Promise<StorageReservation> {
  invariant(
    Number.isSafeInteger(options.maxBytes) &&
      options.maxBytes >= 0 &&
      Number.isSafeInteger(options.reserveBytes) &&
      options.reserveBytes >= 0,
    "Invalid reservation byte limit",
  );
  const id = randomUUID();
  const identity = await localProcessIdentity();
  const owner = {
    id: ownerId,
    host: hostname(),
    pid: process.pid,
    createdAt: new Date().toISOString(),
    repository,
    ...(identity ? { identity } : {}),
  };
  const maxEntries = options.maxEntries ?? transportDefaults.maxEntries;
  invariant(
    Number.isSafeInteger(maxEntries) && maxEntries > 0,
    "Invalid reservation entry limit",
  );
  async function update(release: boolean): Promise<void> {
    for (
      let attempt = 0;
      attempt < transportDefaults.mutationAttempts;
      attempt++
    ) {
      if (!release) options.signal?.throwIfAborted();
      const current = await transporter.read(key);
      const ledger = reservationLedger(jsonObject(current));
      const reservations = { ...ledger.reservations };
      if (release) delete reservations[id];
      if (!release) {
        const usage = measureUsage
          ? await measureUsage()
          : await payloadUsage(transporter, maxEntries, options.signal);
        const reserved = Object.values(reservations).reduce(
          (sum, value) => sum + value.bytes,
          0,
        );
        invariant(
          usage + reserved + options.reserveBytes <= options.maxBytes,
          "Outpost storage reservation admission refused",
        );
        reservations[id] = { bytes: options.reserveBytes, owner };
      }
      try {
        await transporter.write(key, jsonBytes({ format: 2, reservations }), {
          ifRevision: current?.revision ?? null,
          ...(!release && options.signal ? { signal: options.signal } : {}),
        });
        return;
      } catch (error) {
        if (!(error instanceof TransportConflict)) throw error;
      }
    }
    throw new Error("Storage reservation contention limit exceeded");
  }
  try {
    await update(false);
  } catch (error) {
    recordRecovery(error, { reservation: id });
    throw error;
  }
  let released = false;
  const release = async () => {
    if (released) return;
    await update(true);
    released = true;
  };
  return {
    id,
    repository,
    reserveBytes: options.reserveBytes,
    release,
    [Symbol.asyncDispose]: release,
  };
}
