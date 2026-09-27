import { context, SpanStatusCode } from "@opentelemetry/api";
import type { Context, Span } from "@opentelemetry/api";
import type { ObservationScope } from "../domain/observation.types.ts";
import type { WorkflowEvent } from "../domain/workflow.types.ts";
import type {
  OpenTelemetryOptions,
  TelemetryDispatch,
  ObservationTelemetry,
} from "./opentelemetry.types.ts";

export function observationTelemetry(
  options: OpenTelemetryOptions,
  workflow: (event: WorkflowEvent) => void,
  parent: (scope: ObservationScope) => Context | undefined,
  startDispatch: (parent: Context) => TelemetryDispatch,
): ObservationTelemetry {
  const operations = new Map<string, Span>();
  const dispatches = new Map<string, TelemetryDispatch>();
  return {
    observe({ event, scope, source, at }) {
      if (event.kind === "workflow") return workflow(event.event);
      const inherited = parent(scope) ?? context.active();
      if (event.kind === "dispatch-start" && scope.dispatchId) {
        dispatches.set(scope.dispatchId, startDispatch(inherited));
        return;
      }
      if (event.kind === "dispatch-finished" && scope.dispatchId) {
        dispatches.get(scope.dispatchId)?.finish({
          status: event.status,
          completed: event.completed,
          usage: event.usage,
        });
        dispatches.delete(scope.dispatchId);
        return;
      }
      if (event.kind !== "operation") return;
      if (event.status === "started") {
        const dispatch = scope.dispatchId
          ? dispatches.get(scope.dispatchId)
          : undefined;
        operations.set(
          event.id,
          options.tracer.startSpan(
            `outpost.${event.name}`,
            {
              startTime: Date.parse(at),
              attributes: { "outpost.source": source },
            },
            dispatch?.context ?? inherited,
          ),
        );
        return;
      }
      const span = operations.get(event.id);
      span?.setStatus({
        code:
          event.status === "finished"
            ? SpanStatusCode.OK
            : SpanStatusCode.ERROR,
      });
      span?.end(Date.parse(at));
      operations.delete(event.id);
    },
    close() {
      for (const span of operations.values()) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
      }
      operations.clear();
      for (const session of dispatches.values())
        session.finish({
          status: "cancelled",
          usage: { input: 0, cached: 0, output: 0 },
        });
      dispatches.clear();
    },
  };
}
