import { openCheckpoint } from "./checkpoint.ts";
import type { WorkflowCheckpointSession } from "./checkpoint.types.ts";
import type {
  Task,
  WorkflowOptions,
  WorkflowResult,
} from "../workflow.types.ts";
import { WorkflowFailure } from "./failure.ts";
import { runTask } from "./task-runner.ts";
import { positive } from "./validation.ts";
import { workflowState } from "./workflow-state.ts";

export async function schedule(
  name: string,
  tasks: readonly Task[],
  options: WorkflowOptions,
): Promise<WorkflowResult> {
  const checkpoint = options.checkpoint
    ? await openCheckpoint(name, tasks, options.checkpoint)
    : undefined;
  try {
    return await scheduleRun(name, tasks, options, checkpoint);
  } finally {
    await checkpoint?.release();
  }
}

async function scheduleRun(
  name: string,
  tasks: readonly Task[],
  options: WorkflowOptions,
  checkpoint?: WorkflowCheckpointSession,
): Promise<WorkflowResult> {
  const concurrency = options.concurrency ?? 1;
  positive(concurrency, "concurrency");
  const state = workflowState(name, tasks, options, checkpoint);
  const {
    executionId,
    signal,
    values,
    records,
    errors,
    observerErrors,
    record,
    emit,
    finish,
  } = state;
  const active = new Map<Task, Promise<void>>();
  const started = Date.now();
  emit({ type: "start" });
  await state.persist();
  try {
    while (true) {
      let changed = false;
      for (const item of tasks) {
        if (record(item).status !== "waiting") continue;
        if (signal.aborted || state.accounting.exhausted) {
          finish(item, "cancelled");
          changed = true;
          continue;
        }
        const dependencies = item.after.map(
          (dependency) => record(dependency).status,
        );
        if (
          dependencies.some((status) =>
            ["failed", "skipped", "cancelled"].includes(status),
          )
        ) {
          finish(item, "skipped");
          changed = true;
          continue;
        }
        if (
          active.size >= concurrency ||
          item.after.some((dependency) => active.has(dependency)) ||
          !dependencies.every((status) => status === "done")
        )
          continue;
        const running = runTask(item, state).finally(() => {
          active.delete(item);
        });
        active.set(item, running);
        changed = true;
      }
      if (active.size) {
        await Promise.race(active.values());
        continue;
      }
      if (!changed) break;
    }
  } catch (error) {
    state.stop.abort(error);
    await Promise.allSettled(active.values());
    throw error;
  }
  await state.persist();
  if (options.signal?.aborted) errors.push(options.signal.reason);
  const status = options.signal?.aborted
    ? "cancelled"
    : errors.length
      ? "failed"
      : "done";
  emit({ type: "finish", status, durationMs: Date.now() - started });
  const result: WorkflowResult = Object.freeze({
    executionId,
    name,
    status,
    usage: state.accounting.snapshot(),
    tasks: Object.freeze(
      [...records.values()].map((value) => Object.freeze({ ...value })),
    ),
    errors: Object.freeze(errors),
    observerErrors: Object.freeze(observerErrors),
    value<T>(item: Task<T>): T {
      if (!values.has(item))
        throw new Error(
          `${item.key} has no successful value in this execution`,
        );
      return values.get(item) as T;
    },
    unwrap() {
      if (status !== "done") throw new WorkflowFailure(result);
    },
  });
  return result;
}
