import timers from "node:timers/promises";
import { OutpostError } from "../errors.ts";
import type { Retry } from "../workflow.types.ts";
import { defaultMaxRetryDelayMs, maxTimerMs } from "./retry.constants.ts";
import { positive } from "./validation.ts";

export function validateRetry(retry: Retry): void {
  positive(retry.attempts, "retry.attempts");
  for (const [name, value] of [
    ["delayMs", retry.delayMs],
    ["maxDelayMs", retry.maxDelayMs],
  ] as const) {
    if (
      value !== undefined &&
      (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER)
    )
      throw new Error(`retry.${name} must be nonnegative and safely bounded`);
  }
  if (
    retry.backoff !== undefined &&
    !["fixed", "exponential"].includes(retry.backoff)
  )
    throw new Error("retry.backoff must be fixed or exponential");
  if (retry.jitter !== undefined && !["none", "full"].includes(retry.jitter))
    throw new Error("retry.jitter must be none or full");
}

export function retryDelay(
  retry: Retry | undefined,
  cycle: number,
  error: unknown,
  random = Math.random,
): number {
  let duration = retry?.delayMs ?? 0;
  if (retry?.backoff === "exponential" && duration > 0)
    duration *= 2 ** Math.min(cycle - 1, 1024);
  const cap =
    retry?.maxDelayMs ??
    (retry?.backoff === "exponential"
      ? defaultMaxRetryDelayMs
      : Number.MAX_SAFE_INTEGER);
  duration = Math.min(duration, cap);
  if (retry?.jitter === "full") duration *= random();
  const server =
    error instanceof OutpostError ? error.details.retryAfterMs : undefined;
  if (
    typeof server === "number" &&
    Number.isFinite(server) &&
    server >= 0 &&
    server <= Number.MAX_SAFE_INTEGER
  )
    duration = Math.max(duration, server);
  return Math.ceil(duration);
}

export async function waitForRetry(
  duration: number,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  let remaining = duration;
  do {
    const chunk = Math.min(remaining, maxTimerMs);
    await timers.setTimeout(chunk, undefined, { signal });
    remaining -= chunk;
  } while (remaining > 0);
}
