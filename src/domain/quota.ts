import { OutpostError } from "./errors.ts";
import { maxQuotaCauseDepth } from "./quota.constants.ts";
import type { QuotaFault } from "./quota.types.ts";

export type { QuotaFault } from "./quota.types.ts";

export function quotaFault(error: unknown): QuotaFault | undefined {
  let current = error;
  for (let depth = 0; depth < maxQuotaCauseDepth; depth++) {
    if (current instanceof OutpostError && current.code === "quota") {
      const { resetAt, conversation } = current.details;
      return Object.freeze({
        message: current.message,
        ...(typeof resetAt === "string" && Number.isFinite(Date.parse(resetAt))
          ? { resetAt }
          : {}),
        ...(typeof conversation === "string" && conversation
          ? { conversation }
          : {}),
      });
    }
    if (!(current instanceof Error)) return undefined;
    current = current.cause;
  }
  return undefined;
}

export function resetTimestamp(
  delayMs: number,
  now = Date.now(),
): string | undefined {
  const reset = new Date(now + delayMs);
  return Number.isFinite(reset.getTime()) ? reset.toISOString() : undefined;
}
