import { reserveRecoveryStorage } from "../../src/application/storage-reservation.ts";
import type { StorageReservation } from "../../src/infrastructure/storage-reservations.types.ts";

let reservation: StorageReservation | undefined;
process.on("message", async (message: unknown) => {
  try {
    if (message === "acquire") {
      reservation = await reserveRecoveryStorage({
        repository: process.argv[2]!,
        maxBytes: 1_100_000,
        reserveBytes: 1_000_000,
      });
      process.send?.({ status: "acquired", id: reservation.id });
    }
    if (message === "release") {
      await reservation?.release();
      process.send?.({ status: "released" });
    }
  } catch (error) {
    process.send?.({ status: "refused", message: String(error) });
  }
});
