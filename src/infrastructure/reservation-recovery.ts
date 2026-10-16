import { invariant } from "../domain/errors.ts";
import { TransportConflict } from "../domain/transport.ts";
import type { Transport } from "../domain/transport.types.ts";
import { jsonBytes, jsonObject } from "./transport-json.ts";
import { reservationLedger } from "./reservation-ledger.ts";
import {
  reservationLedgerKey,
  reservationIdPattern,
} from "./transport-reservations.constants.ts";
import type {
  StorageReservationInspection,
  StorageReservationRecoveryOptions,
} from "./transport-reservations.types.ts";

export async function inspectStorageReservations(
  transporter: Transport,
): Promise<StorageReservationInspection> {
  const current = await transporter.read(reservationLedgerKey);
  const ledger = reservationLedger(jsonObject(current));
  return {
    ...(current ? { revision: current.revision } : {}),
    reservations: ledger.reservations,
  };
}

export async function recoverStorageReservation(
  transporter: Transport,
  options: StorageReservationRecoveryOptions,
): Promise<void> {
  invariant(
    options.processesStopped === true,
    "Reservation recovery requires explicit stopped-owner authorization",
  );
  invariant(
    reservationIdPattern.test(options.id) &&
      typeof options.revision === "string" &&
      options.revision.length > 0,
    "Reservation recovery requires an identifier and inspected revision",
  );
  const current = await transporter.read(reservationLedgerKey);
  if (!current || current.revision !== options.revision)
    throw new TransportConflict(reservationLedgerKey);
  const ledger = reservationLedger(jsonObject(current));
  invariant(
    Object.hasOwn(ledger.reservations, options.id),
    "Reservation no longer exists",
  );
  const reservations = { ...ledger.reservations };
  delete reservations[options.id];
  await transporter.write(
    reservationLedgerKey,
    jsonBytes({ format: 2, reservations }),
    { ifRevision: current.revision },
  );
}
