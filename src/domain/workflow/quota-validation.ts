import type { Task } from "../workflow.types.ts";

function timestamp(value: unknown): boolean {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function validateQuotaRecord(
  record: Record<string, unknown>,
  item: Task,
): void {
  const pause = record.quota;
  if (pause === undefined) return;
  const invalid = () => new Error("Invalid workflow checkpoint quota record");
  if (
    item.gate ||
    record.status !== "paused" ||
    record.attempts === 0 ||
    pause === null ||
    typeof pause !== "object" ||
    Array.isArray(pause)
  )
    throw invalid();
  const fields = pause as Record<string, unknown>;
  if (
    Object.keys(fields).some(
      (key) => !["requestedAt", "message", "resetAt"].includes(key),
    ) ||
    !timestamp(fields.requestedAt) ||
    typeof fields.message !== "string" ||
    (fields.resetAt !== undefined && !timestamp(fields.resetAt))
  )
    throw invalid();
}
