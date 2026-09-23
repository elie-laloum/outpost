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
  const concurrency = options.concurrency ?? 1;
  positive(concurrency, "concurrency");
  const state = workflowState(name, tasks, options);
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
  emit({ type: "start" });
  while (true) {
    let changed = false;
    for (const item of tasks) {
      if (record(item).status !== "waiting") continue;
      if (signal.aborted) {
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
        !dependencies.every((status) => status === "done")
      )
        continue;
      const running = runTask(item, state).finally(() => {
        active.delete(item);
      });
      active.set(item, running);
      changed = true;
    }
    if (active.size) await Promise.race(active.values());
    if (!active.size && !changed) break;
  }
  if (options.signal?.aborted) errors.push(options.signal.reason);
  const status = options.signal?.aborted
    ? "cancelled"
    : errors.length
      ? "failed"
      : "done";
  emit({ type: "finish" });
  const result: WorkflowResult = Object.freeze({
    executionId,
    name,
    status,
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
