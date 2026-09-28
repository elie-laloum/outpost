import { createHash } from "node:crypto";

export function taskIdempotencyKey(executionId: string, key: string): string {
  return createHash("sha256")
    .update(JSON.stringify([executionId, key]))
    .digest("hex");
}
