import { InputSuspension } from "./input.ts";
import { loopDefinition } from "./loop-task.ts";
import { runLoopTask } from "./loop-runner.ts";
import { checkpointValue } from "./checkpoint-value.ts";
import {
  WorkflowBudgetExceeded,
  WorkflowUsageUnavailable,
  WorkflowCostUnavailable,
} from "./budget.ts";
import { awaitQuotaReset, pauseForQuota } from "./quota-pause.ts";
import { retryDelay, waitForRetry } from "./retry.ts";
import { lookupTaskCache, storeTaskCache } from "./task-cache.ts";
import { quotaFault } from "../quota.ts";
import { OutpostError } from "../errors.ts";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type { TaskCacheLookup } from "./task-cache.types.ts";

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
    errors,
    options,
    stop,
    values,
  } = runtime;
  const state = record(item);
  if (state.quota && !(await awaitQuotaReset(item, runtime, true))) return;
  state.status = "active";
  delete state.error;
  delete state.finishedAt;
  delete state.cacheHit;
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
    const cache = item.cache
      ? await lookupTaskCache(item, item.cache, runtime)
      : undefined;
    if (cache?.hit) {
      values.set(item, cache.value);
      state.cacheHit = true;
      finish(item, "done");
      return;
    }
    while (true) {
      try {
        await perform(item, runtime, cache);
        return;
      } catch (error) {
        if (!(await pauseForQuota(item, runtime, error))) throw error;
        if (!(await awaitQuotaReset(item, runtime, false))) return;
        state.status = "active";
        delete state.finishedAt;
        emit({ type: "task", key: item.key, status: "active", attempt: 0 });
        await runtime.persist();
      }
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
    if (
      signal.aborted ||
      ((error instanceof WorkflowBudgetExceeded ||
        error instanceof WorkflowUsageUnavailable ||
        error instanceof WorkflowCostUnavailable) &&
        runtime.accounting.exhausted)
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

async function complete(
  item: Task,
  runtime: WorkflowExecutionState,
  cache: TaskCacheLookup | undefined,
  value: unknown,
): Promise<void> {
  if (item.cache && cache && !cache.hit)
    await storeTaskCache(item, item.cache, runtime, cache.fingerprint, value);
  runtime.values.set(item, value);
  runtime.finish(item, "done");
}

async function perform(
  item: Task,
  runtime: WorkflowExecutionState,
  cache: TaskCacheLookup | undefined,
): Promise<void> {
  const { record, signal, context, emit, finish, options } = runtime;
  const state = record(item);
  const loop = loopDefinition(item);
  if (loop) {
    const value = await runLoopTask(item, loop, runtime);
    signal.throwIfAborted();
    await complete(item, runtime, cache, value);
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
    let delayMs = 0;
    let completed = false;
    let value: unknown;
    const deadline = new AbortController();
    const timer =
      item.timeoutMs === undefined
        ? undefined
        : setTimeout(
            () =>
              deadline.abort(
                new OutpostError("timeout", `${item.key} timed out`, {
                  key: item.key,
                  timeoutMs: item.timeoutMs,
                }),
              ),
            item.timeoutMs,
          );
    const taskSignal = AbortSignal.any([signal, deadline.signal]);
    try {
      taskSignal.throwIfAborted();
      value = await item.perform(context(item, attempt, taskSignal));
      taskSignal.throwIfAborted();
      if (options.checkpoint) checkpointValue(value);
      completed = true;
    } catch (error) {
      runtime.closeAttempt(item);
      if (error instanceof InputSuspension && item.interaction) {
        state.interaction = error.interaction;
        finish(item, "waiting-input");
        emit({
          type: "input-request",
          key: item.key,
          status: "waiting-input",
        });
        return;
      }
      if (
        signal.aborted ||
        cycle === limit ||
        (options.onQuota && quotaFault(error)) ||
        item.retry?.accepts?.(error, attempt) === false
      )
        throw deadline.signal.aborted ? deadline.signal.reason : error;
      delayMs = retryDelay(item.retry, cycle, error);
      emit({ type: "retry", key: item.key, attempt, delayMs });
    } finally {
      runtime.closeAttempt(item);
      clearTimeout(timer);
    }
    if (completed) {
      await complete(item, runtime, cache, value);
      return;
    }
    await waitForRetry(delayMs, signal);
  }
}
