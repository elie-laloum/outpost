import { maxFaultCauseDepth } from "./errors.constants.ts";
import type { FaultCode } from "./errors.types.ts";

export type { FaultCode } from "./errors.types.ts";

export class OutpostError extends Error {
  recovery: Readonly<Record<string, unknown>> = {};
  readonly code: FaultCode;
  readonly details: Readonly<Record<string, unknown>>;
  constructor(
    code: FaultCode,
    message: string,
    details: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "OutpostError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const recoveryRecords = new WeakMap<
  object,
  Readonly<Record<string, unknown>>
>();

export function recordRecovery(
  error: unknown,
  details: Record<string, unknown>,
): void {
  if (error && (typeof error === "object" || typeof error === "function")) {
    const previous = recoveryDetails(error);
    const recovery = Object.freeze({ ...previous, ...details });
    recoveryRecords.set(error, recovery);
    if (error instanceof OutpostError) error.recovery = recovery;
  }
}

export function recoveryDetails(
  error: unknown,
): Readonly<Record<string, unknown>> | undefined {
  return error instanceof OutpostError
    ? error.recovery
    : error && (typeof error === "object" || typeof error === "function")
      ? recoveryRecords.get(error)
      : undefined;
}

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new OutpostError("configuration", message);
}

export function positive(value: number, label: string): number {
  invariant(
    Number.isSafeInteger(value) && value > 0,
    `${label} must be a positive integer`,
  );
  return value;
}

/** First OutpostError in the cause chain that satisfies the predicate. */
export function findFault(
  error: unknown,
  matches: (fault: OutpostError) => boolean,
): OutpostError | undefined {
  let current = error;
  for (let depth = 0; depth < maxFaultCauseDepth; depth++) {
    if (current instanceof OutpostError && matches(current)) return current;
    if (!(current instanceof Error)) return undefined;
    current = current.cause;
  }
  return undefined;
}
