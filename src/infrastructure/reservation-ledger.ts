import { invariant } from "../domain/errors.ts";
import { reservationIdPattern } from "./transport-reservations.constants.ts";
import type {
  ReservationLedger,
  StorageReservationRecord,
} from "./transport-reservations.types.ts";

function record(value: unknown): StorageReservationRecord {
  invariant(
    value &&
      typeof value === "object" &&
      "bytes" in value &&
      typeof value.bytes === "number" &&
      Number.isSafeInteger(value.bytes) &&
      value.bytes >= 0,
    "Invalid reservation entry",
  );
  if (!("owner" in value)) return { bytes: value.bytes };
  const owner = value.owner;
  invariant(
    owner &&
      typeof owner === "object" &&
      "id" in owner &&
      typeof owner.id === "string" &&
      reservationIdPattern.test(owner.id) &&
      "host" in owner &&
      typeof owner.host === "string" &&
      owner.host.length > 0 &&
      "pid" in owner &&
      typeof owner.pid === "number" &&
      Number.isSafeInteger(owner.pid) &&
      owner.pid > 0 &&
      "createdAt" in owner &&
      typeof owner.createdAt === "string" &&
      Number.isFinite(Date.parse(owner.createdAt)) &&
      "repository" in owner &&
      typeof owner.repository === "string",
    "Invalid reservation owner",
  );
  let identity;
  if ("identity" in owner) {
    const value = owner.identity;
    invariant(
      value &&
        typeof value === "object" &&
        "host" in value &&
        typeof value.host === "string" &&
        value.host.length > 0 &&
        "boot" in value &&
        typeof value.boot === "string" &&
        value.boot.length > 0 &&
        "namespace" in value &&
        typeof value.namespace === "string" &&
        value.namespace.length > 0 &&
        "started" in value &&
        typeof value.started === "string" &&
        /^\d+$/.test(value.started),
      "Invalid reservation identity",
    );
    identity = {
      host: value.host,
      boot: value.boot,
      namespace: value.namespace,
      started: value.started,
    };
  }
  return {
    bytes: value.bytes,
    owner: {
      id: owner.id,
      host: owner.host,
      pid: owner.pid,
      createdAt: owner.createdAt,
      repository: owner.repository,
      ...(identity ? { identity } : {}),
    },
  };
}

export function reservationLedger(value: unknown): ReservationLedger {
  if (value === undefined) return { format: 2, reservations: {} };
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      (value.format === 1 || value.format === 2) &&
      "reservations" in value &&
      value.reservations &&
      typeof value.reservations === "object" &&
      !Array.isArray(value.reservations),
    "Invalid reservation ledger",
  );
  const legacy = value.format === 1;
  const entries = Object.entries(value.reservations).map(([id, entry]) => {
    invariant(reservationIdPattern.test(id), "Invalid reservation identifier");
    return [id, record(legacy ? { bytes: entry } : entry)];
  });
  return { format: 2, reservations: Object.fromEntries(entries) };
}
