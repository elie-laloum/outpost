import { checkpointValue } from "./checkpoint-value.ts";
import { WorkflowBudgetExceeded } from "./budget.ts";
import { setTimeout as delay } from "node:timers/promises";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";

export async function runTask(
  item: Task,
  runtime: WorkflowExecutionState,
): Promise<void> {
  const {
    record,
    signal,
    context,
    emit,
    finish,
    values,
    errors,
    options,
    stop,
  } = runtime;
  const state = record(item);
  state.status = "active";
  delete state.error;
  delete state.finishedAt;
  state.startedAt = new Date().toISOString();
  emit({ type: "task", key: item.key, status: "active", attempt: 0 });
  try {
    await runtime.persist();
    signal.throwIfAborted();
    if (item.condition && !(await item.condition(context(item, 0, signal)))) {
      signal.throwIfAborted();
      finish(item, "skipped");
      return;
    }
    const limit = item.retry?.attempts ?? 1;
    const priorAttempts = state.attempts;
    for (let cycle = 1; cycle <= limit; cycle++) {
      const attempt = priorAttempts + cycle;
      signal.throwIfAborted();
      runtime.accounting.admit();
      state.attempts = attempt;
      emit({ type: "attempt", key: item.key, attempt });
      await runtime.persist();
      const deadline = new AbortController();
      const timer =
        item.timeoutMs === undefined
          ? undefined
          : setTimeout(
              () => deadline.abort(new Error(`${item.key} timed out`)),
              item.timeoutMs,
            );
      const taskSignal = AbortSignal.any([signal, deadline.signal]);
      try {
        taskSignal.throwIfAborted();
        const value = await item.perform(context(item, attempt, taskSignal));
        taskSignal.throwIfAborted();
        if (options.checkpoint) checkpointValue(value);
        values.set(item, value);
        finish(item, "done");
        return;
      } catch (error) {
        runtime.closeAttempt(item);
        if (
          signal.aborted ||
          cycle === limit ||
          item.retry?.accepts?.(error, attempt) === false
        )
          throw error;
        emit({ type: "retry", key: item.key, attempt });
      } finally {
        runtime.closeAttempt(item);
        clearTimeout(timer);
      }
      await delay(item.retry?.delayMs ?? 0, undefined, { signal });
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
    if (
      signal.aborted ||
      (error instanceof WorkflowBudgetExceeded && runtime.accounting.exhausted)
    )
      finish(item, "cancelled");
    else {
      errors.push(error);
      finish(item, "failed");
      if (options.stopOnError !== false) stop.abort(error);
    }
  } finally {
    await runtime.persist();
  }
}
