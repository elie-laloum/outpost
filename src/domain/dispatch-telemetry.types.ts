import type { Usage } from "./agent.types.ts";

export interface DispatchTelemetryOutcome {
  readonly status: "done" | "failed" | "cancelled";
  readonly usage: Usage;
  readonly completed?: boolean;
}

export interface DispatchTelemetrySession {
  finish(outcome: DispatchTelemetryOutcome): void;
}

export interface DispatchTelemetry {
  startDispatch(): DispatchTelemetrySession;
}
