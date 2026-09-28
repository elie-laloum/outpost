import type { TransportStoreOptions } from "../domain/transport.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";

export interface SpeculationRecoveryOptions extends TransportStoreOptions {
  readonly runId: string;
  readonly revision: string;
  readonly coordinatorStopped: true;
}

export interface SpeculationStoreSession {
  readonly initial: unknown;
  save(value: WorkflowJson): Promise<void>;
  release(): Promise<void>;
}
