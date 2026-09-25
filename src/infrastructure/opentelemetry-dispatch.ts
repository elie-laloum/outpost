import { context, SpanStatusCode } from "@opentelemetry/api";
import type {
  DispatchTelemetryOutcome,
  DispatchTelemetrySession,
} from "../domain/dispatch-telemetry.types.ts";
import type { OpenTelemetryOptions } from "./opentelemetry.types.ts";
import { telemetryNames } from "./opentelemetry.constants.ts";
import { usageDimensions } from "../domain/workflow/budget.constants.ts";

export function dispatchTelemetry(options: OpenTelemetryOptions) {
  function safe<T>(action: () => T): T | undefined {
    try {
      return action();
    } catch (error) {
      try {
        options.onError?.(error);
      } catch {}
    }
  }
  const executions = safe(() =>
    options.meter.createCounter(telemetryNames.dispatches),
  );
  const durations = safe(() =>
    options.meter.createHistogram(telemetryNames.dispatchDuration, {
      unit: "s",
    }),
  );
  const tokens = safe(() =>
    options.meter.createCounter(telemetryNames.dispatchTokens, {
      unit: "{token}",
    }),
  );
  const sessions = new Set<DispatchTelemetrySession>();
  let closed = false;
  return {
    startDispatch(): DispatchTelemetrySession {
      if (closed) return { finish() {} };
      const started = Date.now();
      const span = safe(() =>
        options.tracer.startSpan(
          "outpost.dispatch",
          { startTime: started },
          context.active(),
        ),
      );
      const session: DispatchTelemetrySession = {
        finish(outcome: DispatchTelemetryOutcome) {
          if (!sessions.delete(session)) return;
          const at = Date.now();
          const attributes = { "outpost.status": outcome.status };
          safe(() => span?.setAttributes(attributes));
          if (outcome.completed !== undefined)
            safe(() =>
              span?.setAttribute("outpost.completed", outcome.completed!),
            );
          safe(() =>
            span?.setStatus({
              code:
                outcome.status === "done"
                  ? SpanStatusCode.OK
                  : SpanStatusCode.ERROR,
            }),
          );
          safe(() => span?.end(at));
          safe(() => executions?.add(1, attributes));
          safe(() =>
            durations?.record(Math.max(0, at - started) / 1000, attributes),
          );
          for (const dimension of usageDimensions) {
            const value = outcome.usage[dimension];
            if (value !== undefined && Number.isFinite(value) && value > 0)
              safe(() =>
                tokens?.add(value, { "outpost.token.type": dimension }),
              );
          }
        },
      };
      sessions.add(session);
      return session;
    },
    close() {
      if (closed) return;
      closed = true;
      for (const session of sessions)
        session.finish({
          status: "cancelled",
          usage: { input: 0, cached: 0, output: 0 },
        });
    },
  };
}
