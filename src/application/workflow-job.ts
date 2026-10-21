import { workflowJobNextActions } from "./workflow-job.constants.ts";
import { createHash } from "node:crypto";
import { queueMaxStringLength } from "../domain/task-queue.constants.ts";
import { triggerJobInput } from "../domain/trigger-job.ts";
import { canonicalJson } from "../domain/workflow/canonical-json.ts";
import type { QueueJob, QueueResult } from "../domain/task-queue.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { QueueHandler } from "./queue-worker.types.ts";
import type { WorkflowResult } from "../domain/workflow.types.ts";
import type {
  WorkflowJobOptions,
  WorkflowJobOutcome,
  WorkflowJobState,
} from "./workflow-job.types.ts";

export function workflowJobVersion(
  version: string,
  input: WorkflowJson,
): string {
  const digest = createHash("sha256")
    .update(canonicalJson(input))
    .digest("hex")
    .slice(0, 32);
  return `${version}#input:${digest}`;
}

function summary(
  runId: string,
  version: string,
  result: WorkflowJobOutcome,
): WorkflowJson {
  return {
    runId,
    version,
    executionId: result.executionId,
    status: result.status,
    workflowStatus: result.status,
    nextAction: workflowJobNextActions[result.status],
    ...(result.terminationCode
      ? { terminationCode: result.terminationCode }
      : {}),
    tasks: result.tasks.map((record) => ({
      key: record.key,
      status: record.status,
    })),
    pauses: result.tasks.flatMap((record) =>
      record.pause && record.status === "paused"
        ? [
            {
              key: record.key,
              id: record.pause.id,
              kind: record.pause.kind,
              prompt: record.pause.prompt,
              actors: [...record.pause.actors],
            },
          ]
        : [],
    ),
    inputRequests: result.inputRequests.map((request) => ({
      key: request.key,
      id: request.id,
      question: request.question,
    })),
  };
}

function failure(result: WorkflowJobOutcome): string {
  const [first] = result.errors;
  const detail = first instanceof Error ? `: ${first.message}` : "";
  return `Workflow ${result.status}${detail}`.slice(0, queueMaxStringLength);
}

/** Queue handler running one checkpointed workflow per trigger job. */
export function defineWorkflowJob(options: WorkflowJobOptions): QueueHandler {
  if (typeof options.workflow !== "function")
    throw new Error("defineWorkflowJob() requires a workflow factory");
  if (!options.checkpoint?.store || !options.checkpoint.version)
    throw new Error(
      "defineWorkflowJob() requires a checkpoint store and version",
    );
  return async (value, context): Promise<QueueResult> => {
    const { runId, input } = triggerJobInput(value);
    const workflow = await options.workflow(input, { ...context, runId });
    const version = workflowJobVersion(options.checkpoint.version, input);
    const result = await workflow.start({
      ...options.start,
      signal: context.signal,
      checkpoint: {
        store: options.checkpoint.store,
        runId,
        version,
        ...(options.checkpoint.resume
          ? { resume: options.checkpoint.resume }
          : {}),
      },
    });
    return workflowJobResult(runId, version, result);
  };
}

export function workflowJobResult(
  runId: string,
  version: string,
  result: WorkflowJobOutcome,
): QueueResult {
  const failed = ["failed", "cancelled", "rejected"].includes(result.status);
  return {
    value: summary(runId, version, result),
    usage: result.usage.tokens,
    ...(failed ? { error: failure(result) } : {}),
  };
}

/** Projects a workflow job's delivery state beside the saved workflow state. */
export function readWorkflowJob(job: QueueJob): WorkflowJobState {
  const { runId } = triggerJobInput(job.input);
  const value = job.result?.value;
  const summary = Object.fromEntries(
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.entries(value)
      : [],
  );
  const saved = summary.workflowStatus ?? summary.status;
  if (!isWorkflowStatus(saved)) return { jobStatus: job.status, runId };
  return {
    jobStatus: job.status,
    runId,
    workflowStatus: saved,
    nextAction: workflowJobNextActions[saved],
  };
}

function isWorkflowStatus(value: unknown): value is WorkflowResult["status"] {
  return (
    typeof value === "string" && Object.hasOwn(workflowJobNextActions, value)
  );
}
