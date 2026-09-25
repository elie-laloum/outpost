import { createHash } from "node:crypto";
import { queueJob, queueObject, queueString } from "../domain/task-queue.ts";

export function bullMQKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function bullMQState(value: unknown) {
  if (value === null) return undefined;
  if (!Array.isArray(value) || value.length !== 3)
    throw new Error("Invalid BullMQ queue state");
  const [request, metadata, result]: unknown[] = value;
  if (
    typeof request !== "string" ||
    typeof metadata !== "string" ||
    typeof result !== "string"
  )
    throw new Error("Invalid BullMQ queue state");
  const meta = queueObject(JSON.parse(metadata));
  return {
    job: queueJob({
      ...queueObject(JSON.parse(request)),
      ...meta,
      ...(result ? { result: JSON.parse(result) } : {}),
    }),
    token: meta.token === undefined ? undefined : queueString(meta.token),
  };
}
