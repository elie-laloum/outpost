import { createHash } from "node:crypto";
import { queueMaxStringLength } from "../domain/task-queue.constants.ts";
import { triggerJobInput } from "../domain/trigger-job.ts";
import { canonicalJson } from "../domain/workflow/canonical-json.ts";
import type { QueueResult } from "../domain/task-queue.types.ts";
import type { WorkflowResult } from "../domain/workflow.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { QueueHandler } from "./queue-worker.types.ts";
import type { WorkflowJobOptions } from "./workflow-job.types.ts";

function inputVersion(version: string, input: WorkflowJson): string {
  const digest = createHash("sha256")
    .update(canonicalJson(input))
    .digest("hex")
    .slice(0, 32);
  return `${version}#input:${digest}`;
}

function summary(
  runId: string,
  version: string,
  result: WorkflowResult,
): WorkflowJson {
  return {
    runId,
    version,
    executionId: result.executionId,
    status: result.status,
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

function failure(result: WorkflowResult): string {
  const [first] = result.errors;
  const detail = first instanceof Error ? `: ${first.message}` : "";
  return `Workflow ${result.status}${detail}`.slice(0, queueMaxStringLength);
}

/** Queue handler running one checkpointed workflow per trigger job. */
export function workflowJob(options: WorkflowJobOptions): QueueHandler {
  if (typeof options.workflow !== "function")
    throw new Error("workflowJob() requires a workflow factory");
  if (!options.checkpoint?.store || !options.checkpoint.version)
    throw new Error("workflowJob() requires a checkpoint store and version");
  return async (value, context): Promise<QueueResult> => {
    const { runId, input } = triggerJobInput(value);
    const workflow = await options.workflow(input, { ...context, runId });
    const version = inputVersion(options.checkpoint.version, input);
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
    const tokens = result.usage.tokens;
    const failed = result.status === "failed" || result.status === "cancelled";
    return {
      value: summary(runId, version, result),
      usage: {
        input: tokens.input,
        output: tokens.output,
        cached: tokens.cached,
        ...(tokens.cacheCreated === undefined
          ? {}
          : { cacheCreated: tokens.cacheCreated }),
      },
      ...(failed ? { error: failure(result) } : {}),
    };
  };
}
