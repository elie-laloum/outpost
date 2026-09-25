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
import type { ReservationLedger } from "./transport-reservations.types.ts";

const key = "reservations/ledger";

export function reservationLedger(value: unknown): ReservationLedger {
  if (value === undefined) return { format: 1, reservations: {} };
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "reservations" in value &&
      value.reservations &&
      typeof value.reservations === "object" &&
      !Array.isArray(value.reservations),
    "Invalid reservation ledger",
  );
  const entries = Object.entries(value.reservations);
  invariant(
    entries.every(
      ([id, bytes]) =>
        /^[a-f0-9-]{36}$/.test(id) &&
        typeof bytes === "number" &&
        Number.isSafeInteger(bytes) &&
        bytes >= 0,
    ),
    "Invalid reservation entry",
  );
  return { format: 1, reservations: Object.fromEntries(entries) };
}

export async function reserveTransportStorage(
  transporter: Transport,
  repository: string,
  options: StorageReservationOptions,
): Promise<StorageReservation> {
  invariant(
    Number.isSafeInteger(options.maxBytes) &&
      options.maxBytes >= 0 &&
      Number.isSafeInteger(options.reserveBytes) &&
      options.reserveBytes >= 0,
    "Invalid reservation byte limit",
  );
  const id = randomUUID();
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
        let usage = 0,
          count = 0;
        for await (const entry of transporter.list(
          "",
          options.signal ? { signal: options.signal } : {},
        )) {
          invariant(
            ++count <= maxEntries,
            "Reservation inventory is incomplete",
          );
          if (entry.key !== key) usage += entry.size;
        }
        const reserved = Object.values(reservations).reduce(
          (sum, value) => sum + value,
          0,
        );
        invariant(
          usage + reserved + options.reserveBytes <= options.maxBytes,
          "Outpost storage quota admission refused",
        );
        reservations[id] = options.reserveBytes;
      }
      try {
        await transporter.write(key, jsonBytes({ format: 1, reservations }), {
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
