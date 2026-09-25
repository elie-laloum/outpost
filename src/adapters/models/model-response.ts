import { OutpostError } from "../../domain/errors.ts";

export function requireResponse(condition: unknown): asserts condition {
  if (!condition)
    throw new OutpostError("response", "Invalid or unsupported model response");
}

export function object(value: unknown): Record<string, unknown> {
  requireResponse(
    value !== null && typeof value === "object" && !Array.isArray(value),
  );
  return value as Record<string, unknown>;
}

export function tokens(value: unknown): number {
  requireResponse(
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0,
  );
  return value;
}
