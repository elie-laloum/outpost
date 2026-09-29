import { queueJson, queueObject, queueRequest } from "./task-queue.ts";
import type { QueueRequest } from "./task-queue.types.ts";
import type { WorkflowJson } from "./workflow/checkpoint.types.ts";
import { triggerRunIdMaxLength } from "./trigger-job.constants.ts";
import type { TriggerJob, TriggerJobInput } from "./trigger-job.types.ts";

function runId(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > triggerRunIdMaxLength
  )
    throw new Error(
      "Trigger runId must be a non-empty string of at most 256 characters",
    );
  return value;
}

export function triggerQueueRequest(id: string, job: TriggerJob): QueueRequest {
  const data = queueObject(job);
  return queueRequest({
    id,
    handler: data.handler,
    input: { runId: runId(data.runId), input: data.input ?? null },
  });
}

export function triggerJobInput(value: WorkflowJson): TriggerJobInput {
  const data = queueObject(value);
  return { runId: runId(data.runId), input: queueJson(data.input) };
}
