import type { AgentObservation } from "../domain/agent.types.ts";

export type ReporterHandlers = {
  readonly [Kind in AgentObservation["kind"]]?: (
    event: Extract<AgentObservation, { kind: Kind }>,
  ) => void | Promise<void>;
};

export interface CustomReporterOptions {
  readonly onError?: (
    error: unknown,
    event: AgentObservation,
  ) => void | Promise<void>;
}

export interface CustomReporter {
  (event: AgentObservation): void;
  flush(): Promise<void>;
}
