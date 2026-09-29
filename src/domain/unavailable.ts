import { findFault } from "./errors.ts";
import type { UnavailableFault } from "./unavailable.types.ts";

export type { UnavailableFault } from "./unavailable.types.ts";

export function unavailableFault(error: unknown): UnavailableFault | undefined {
  const fault = findFault(
    error,
    (candidate) =>
      candidate.code !== "quota" &&
      typeof candidate.details.unavailable === "string",
  );
  return fault
    ? Object.freeze({ message: String(fault.details.unavailable) })
    : undefined;
}
