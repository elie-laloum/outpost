import { maxUsageReceiptsPerTask } from "./usage-receipt.constants.ts";
import { validateUsageReceipt } from "./usage-receipt.ts";
import type { Usage } from "../agent.types.ts";
import type { WorkflowCheckpointSession } from "./checkpoint.types.ts";
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
  checkpoint?: WorkflowCheckpointSession,
): WorkflowExecutionState {
  const executionId = checkpoint?.initial?.executionId ?? randomUUID();
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
  const saved = checkpoint?.initial;
  if (saved) {
    const complete = saved.records.every((entry) =>
      ["done", "skipped"].includes(entry.status),
    );
    const settledPause =
      saved.records.some((entry) =>
        ["paused", "rejected"].includes(entry.status),
      ) &&
      saved.records.every(
        (entry) =>
          ["done", "skipped", "paused", "rejected"].includes(entry.status) ||
          (entry.status === "waiting" && entry.attempts === 0),
      );
    for (const item of tasks) {
      const entry = saved.records.find((entry) => entry.key === item.key)!;
      records.set(item, {
        ...entry,
        ...(entry.usageReceipts
          ? { usageReceipts: Object.freeze([...entry.usageReceipts]) }
          : {}),
        ...(entry.pause
          ? {
              pause: Object.freeze({
                ...entry.pause,
                actors: Object.freeze([...entry.pause.actors]),
              }),
            }
          : {}),
        ...(entry.decision
          ? { decision: Object.freeze({ ...entry.decision }) }
          : {}),
        status:
          ["done", "paused", "rejected"].includes(entry.status) ||
          complete ||
          (settledPause && entry.status === "skipped")
            ? entry.status
            : "waiting",
      });
      if (entry.status === "done") {
        const output = saved.values[item.key]!;
        values.set(item, output.kind === "json" ? output.value : undefined);
      }
    }
  }
  const errors: unknown[] = [],
    observerErrors: unknown[] = [];
  for (const entry of records.values())
    if (entry.status === "rejected") errors.push(new Error(entry.error));
  const accounting = workflowAccounting(
    options.budget,
    (error) => {
      errors.push(error);
      if (error.dimension !== "attempts") stop.abort(error);
    },
    saved?.usage,
  );
  const record = (item: Task) => records.get(item)!;
  function emit(
    event: Omit<WorkflowEvent, "executionId" | "workflow" | "timestamp">,
  ): void {
    const notification: WorkflowEvent = {
      ...event,
      executionId,
      workflow: name,
      timestamp: new Date().toISOString(),
    };
    try {
      options.telemetry?.observe(notification);
    } catch (error) {
      observerErrors.push(error);
    }
    try {
      options.observe?.(notification);
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
    function report(usage: Usage, receipt?: string): void {
      const current = record(item);
      if (
        attempt === 0 ||
        current.status !== "active" ||
        activeAttempts.get(item) !== attempt
      )
        throw new Error(
          "Usage must be reported during its active task attempt",
        );
      if (receipt !== undefined) {
        validateUsageReceipt(receipt);
        if (current.usageReceipts?.includes(receipt)) return;
        if ((current.usageReceipts?.length ?? 0) >= maxUsageReceiptsPerTask)
          throw new Error("Workflow usage receipt limit exceeded");
      }
      const previousReceipts = current.usageReceipts;
      if (receipt !== undefined)
        current.usageReceipts = Object.freeze([
          ...(previousReceipts ?? []),
          receipt,
        ]);
      try {
        accounting.report(usage);
      } catch (error) {
        if (previousReceipts) current.usageReceipts = previousReceipts;
        else delete current.usageReceipts;
        throw error;
      }
      void runtime.persist().catch((error: unknown) => stop.abort(error));
      emit({
        type: "usage",
        key: item.key,
        attempt,
        usage: Object.freeze({ ...usage }),
      });
    }

    return {
      signal: taskSignal,
      attempt,
      executionId,
      checkpoint: () => runtime.persist(),
      reportUsage: (usage) => report(usage),
      reportUsageOnce: (receipt, usage) => {
        validateUsageReceipt(receipt);
        report(usage, receipt);
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

  const runtime: WorkflowExecutionState = {
    async persist() {
      await checkpoint?.save(runtime);
    },
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
  return runtime;
}
