import type { ObservationSink } from "../domain/observation.types.ts";
import type { Context, Meter, Span, Tracer } from "@opentelemetry/api";
import type {
  DispatchTelemetrySession,
  DispatchTelemetry,
} from "../domain/dispatch-telemetry.types.ts";
import type { WorkflowTelemetry } from "../domain/workflow.types.ts";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}

export interface OpenTelemetryObserver
  extends DispatchTelemetry, WorkflowTelemetry {
  readonly sink: import("../domain/observation.types.ts").ObservationSink;
  close(): void;
}

export interface TelemetryOperation {
  readonly span: Span | undefined;
  readonly context: Context;
  readonly started: number;
}

export interface TelemetryExecution {
  readonly workflow: TelemetryOperation;
  readonly tasks: Map<string, TelemetryOperation>;
  readonly attempts: Map<string, TelemetryOperation>;
}

export interface TelemetryDispatch extends DispatchTelemetrySession {
  readonly context: Context;
}

export interface ObservationTelemetry extends ObservationSink {
  close(): void;
}
