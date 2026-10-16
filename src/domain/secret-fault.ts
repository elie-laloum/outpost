import { OutpostError } from "./errors.ts";
import type { FaultCode } from "./errors.types.ts";

const diagnostics = new WeakMap<object, () => OutpostError>();

export function secretFault(code: FaultCode, message: string): OutpostError {
  const error = new OutpostError(code, message);
  diagnostics.set(error, () => new OutpostError(code, message));
  return error;
}

export function safeSecretFault(error: unknown): OutpostError | undefined {
  return error instanceof Error ? diagnostics.get(error)?.() : undefined;
}
