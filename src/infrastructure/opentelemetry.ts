import { dispatchTelemetry } from "./opentelemetry-dispatch.ts";
import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import type { Context, Histogram } from "@opentelemetry/api";
import type { WorkflowEvent } from "../domain/workflow.types.ts";
import { usageDimensions } from "../domain/workflow/budget.constants.ts";
import { telemetryNames } from "./opentelemetry.constants.ts";
import type {
  OpenTelemetryObserver,
  OpenTelemetryOptions,
  TelemetryExecution,
  TelemetryOperation,
} from "./opentelemetry.types.ts";

export type {
  OpenTelemetryObserver,
  OpenTelemetryOptions,
} from "./opentelemetry.types.ts";

export function openTelemetry(
  options: OpenTelemetryOptions,
): OpenTelemetryObserver {
  const dispatches = dispatchTelemetry(options);
  function safe<T>(action: () => T): T | undefined {
    try {
      return action();
    } catch (error) {
      try {
        options.onError?.(error);
      } catch {}
    }
  }
  const counters = {
    workflows: safe(() =>
      options.meter.createCounter(telemetryNames.workflows),
    ),
    tasks: safe(() => options.meter.createCounter(telemetryNames.tasks)),
    attempts: safe(() => options.meter.createCounter(telemetryNames.attempts)),
    retries: safe(() => options.meter.createCounter(telemetryNames.retries)),
    usage: safe(() =>
      options.meter.createCounter(telemetryNames.usage, { unit: "{token}" }),
    ),
  };
  const durations = {
    workflow: safe(() =>
      options.meter.createHistogram(telemetryNames.workflowDuration, {
        unit: "s",
      }),
    ),
    task: safe(() =>
      options.meter.createHistogram(telemetryNames.taskDuration, { unit: "s" }),
    ),
    attempt: safe(() =>
      options.meter.createHistogram(telemetryNames.attemptDuration, {
        unit: "s",
      }),
    ),
  };
  const executions = new Map<string, TelemetryExecution>();
  let closed = false;
  function start(
    name: string,
    parent: Context,
    at: number,
  ): TelemetryOperation {
    const span = safe(() =>
      options.tracer.startSpan(name, { startTime: at }, parent),
    );
    return {
      span,
      context: span ? trace.setSpan(parent, span) : parent,
      started: at,
    };
  }
  function finish(
    operation: TelemetryOperation | undefined,
    status: string,
    at: number,
    duration: Histogram | undefined,
  ): void {
    if (!operation) return;
    const attributes = { "outpost.status": status };
    safe(() => operation.span?.setAttributes(attributes));
    if (status !== "skipped" && status !== "paused")
      safe(() =>
        operation.span?.setStatus({
          code: status === "done" ? SpanStatusCode.OK : SpanStatusCode.ERROR,
        }),
      );
    safe(() => operation.span?.end(at));
    safe(() =>
      duration?.record(Math.max(0, at - operation.started) / 1000, attributes),
    );
  }
  function complete(
    execution: TelemetryExecution,
    status: string,
    at: number,
  ): void {
    for (const attempt of execution.attempts.values())
      finish(attempt, status, at, durations.attempt);
    for (const task of execution.tasks.values())
      finish(task, status, at, durations.task);
    finish(execution.workflow, status, at, durations.workflow);
    safe(() => counters.workflows?.add(1, { "outpost.status": status }));
  }
  return {
    startDispatch: dispatches.startDispatch,
    observe(event: WorkflowEvent) {
      if (closed) return;
      const at = Date.parse(event.timestamp);
      if (!Number.isFinite(at)) return;
      if (event.type === "start") {
        if (executions.has(event.executionId)) return;
        executions.set(event.executionId, {
          workflow: start("outpost.workflow", context.active(), at),
          tasks: new Map(),
          attempts: new Map(),
        });
        return;
      }
      const execution = executions.get(event.executionId);
      if (!execution) return;
      if (event.type === "finish") {
        executions.delete(event.executionId);
        complete(execution, event.status ?? "done", at);
        return;
      }
      if (event.type === "usage") {
        for (const dimension of usageDimensions) {
          const value = event.usage?.[dimension];
          if (value !== undefined && Number.isFinite(value) && value > 0)
            safe(() =>
              counters.usage?.add(value, { "outpost.token.type": dimension }),
            );
        }
        return;
      }
      if (event.key === undefined) return;
      if (event.type === "attempt") {
        execution.attempts.set(
          event.key,
          start(
            "outpost.task.attempt",
            execution.tasks.get(event.key)?.context ??
              execution.workflow.context,
            at,
          ),
        );
        safe(() => counters.attempts?.add(1));
        return;
      }
      if (event.type === "retry") {
        finish(
          execution.attempts.get(event.key),
          "failed",
          at,
          durations.attempt,
        );
        execution.attempts.delete(event.key);
        safe(() => counters.retries?.add(1));
        return;
      }
      if (event.type === "task" && event.status === "active") {
        execution.tasks.set(
          event.key,
          start("outpost.task", execution.workflow.context, at),
        );
        return;
      }
      if (event.type === "task" && event.status) {
        finish(
          execution.attempts.get(event.key),
          event.status,
          at,
          durations.attempt,
        );
        finish(
          execution.tasks.get(event.key),
          event.status,
          at,
          durations.task,
        );
        execution.attempts.delete(event.key);
        execution.tasks.delete(event.key);
        safe(() => counters.tasks?.add(1, { "outpost.status": event.status }));
      }
    },
    close() {
      if (closed) return;
      closed = true;
      dispatches.close();
      for (const execution of executions.values())
        complete(execution, "cancelled", Date.now());
      executions.clear();
    },
  };
}
