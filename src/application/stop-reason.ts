import type { AgentStopReason } from "./stop-reason.types.ts";
import { OutpostError } from "../domain/errors.ts";

export function stopReason(
  signal: AbortSignal | undefined,
  reason: unknown,
  cause: unknown,
): AgentStopReason | undefined {
  if (signal?.aborted) return "aborted";
  if (reason === "completion") return "completion";
  for (const error of [reason, cause]) {
    if (!(error instanceof OutpostError)) continue;
    if (error.details.stopReason === "oversized-event")
      return "oversized-event";
    if (error.details.stopReason === "idle-timeout") return "idle-timeout";
    if (error.code === "timeout") return "deadline";
    if (error.code === "aborted") return "aborted";
  }
  return undefined;
}
