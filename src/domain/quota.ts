import { findFault } from "./errors.ts";
import type { QuotaFault } from "./quota.types.ts";

export type { QuotaFault } from "./quota.types.ts";

export function quotaFault(error: unknown): QuotaFault | undefined {
  const fault = findFault(error, (candidate) => candidate.code === "quota");
  if (!fault) return undefined;
  const { resetAt, conversation } = fault.details;
  return Object.freeze({
    message: fault.message,
    ...(typeof resetAt === "string" && Number.isFinite(Date.parse(resetAt))
      ? { resetAt }
      : {}),
    ...(typeof conversation === "string" && conversation
      ? { conversation }
      : {}),
  });
}

export function resetTimestamp(
  delayMs: number,
  now = Date.now(),
): string | undefined {
  const reset = new Date(now + delayMs);
  return Number.isFinite(reset.getTime()) ? reset.toISOString() : undefined;
}
