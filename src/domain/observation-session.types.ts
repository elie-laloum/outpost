import type { ObservationHub } from "./observation.types.ts";

export interface ObservationSessionOptions {
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly resume?: boolean;
  readonly executionId?: string;
}

export interface ObservationSession {
  readonly observation: ObservationHub;
  close(): Promise<void>;
}

export type ObservationSessionFactory = (
  options: ObservationSessionOptions,
) => Promise<ObservationSession>;
