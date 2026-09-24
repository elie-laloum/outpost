import { workflowAccounting } from "./budget.ts";
import { randomUUID } from "node:crypto";
import type {
  Task,
  TaskContext,
  TaskRecord,
  TaskStatus,
  WorkflowEvent,
  WorkflowExecutionState,
  WorkflowOptions,
} from "../workflow.types.ts";

export function workflowState(
  name: string,
  tasks: readonly Task[],
  options: WorkflowOptions,
): WorkflowExecutionState {
  const executionId = randomUUID();
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  const values = new Map<Task, unknown>();
  const activeAttempts = new Map<Task, number>();
  const records = new Map<Task, TaskRecord>(
    tasks.map((item) => [
      item,
      { key: item.key, status: "waiting", attempts: 0 },
    ]),
  );
  const errors: unknown[] = [],
    observerErrors: unknown[] = [];
  const accounting = workflowAccounting(options.budget, (error) => {
    errors.push(error);
    if (error.dimension !== "attempts") stop.abort(error);
  });
  const record = (item: Task) => records.get(item)!;
  function emit(
    event: Omit<WorkflowEvent, "executionId" | "workflow" | "timestamp">,
  ): void {
    try {
      options.observe?.({
        ...event,
        executionId,
        workflow: name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      observerErrors.push(error);
    }
  }
  function finish(item: Task, status: TaskStatus): void {
    Object.assign(record(item), {
      status,
      finishedAt: new Date().toISOString(),
    });
    emit({
      type: "task",
      key: item.key,
      status,
      attempt: record(item).attempts,
      ...(record(item).startedAt
        ? { durationMs: Date.now() - Date.parse(record(item).startedAt!) }
        : {}),
    });
  }
  function context(
    item: Task,
    attempt: number,
    taskSignal: AbortSignal,
  ): TaskContext {
    if (attempt > 0) activeAttempts.set(item, attempt);
    return {
      signal: taskSignal,
      attempt,
      executionId,
      reportUsage(usage) {
        if (
          attempt === 0 ||
          record(item).status !== "active" ||
          activeAttempts.get(item) !== attempt
        )
          throw new Error(
            "Usage must be reported during its active task attempt",
          );
        accounting.report(usage);
        emit({
          type: "usage",
          key: item.key,
          attempt,
          usage: Object.freeze({ ...usage }),
        });
      },
      value<T>(dependency: Task<T>): T {
        if (!item.after.includes(dependency))
          throw new Error(
            `${item.key}: undeclared dependency ${dependency.key}`,
          );
        if (!values.has(dependency))
          throw new Error(`${dependency.key} has no successful value`);
        return values.get(dependency) as T;
      },
    };
  }

  return {
    executionId,
    accounting,
    closeAttempt(item) {
      activeAttempts.delete(item);
    },
    stop,
    signal,
    values,
    records,
    errors,
    observerErrors,
    record,
    emit,
    finish,
    context,
    options,
  };
}
