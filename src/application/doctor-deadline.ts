import { invariant } from "../domain/errors.ts";
import { doctorDefaults } from "./doctor.constants.ts";

export function doctorDeadline(
  value: number | undefined,
  fallback: number,
): number {
  const deadline = value ?? fallback;
  invariant(
    Number.isSafeInteger(deadline) &&
      deadline > 0 &&
      deadline <= doctorDefaults.maximumDeadlineMs,
    `Diagnostic timeout must be an integer between 1 and ${doctorDefaults.maximumDeadlineMs} milliseconds.`,
  );
  return deadline;
}
