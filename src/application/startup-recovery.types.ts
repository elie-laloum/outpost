import type { Logging } from "../infrastructure/journal.types.ts";

export type StartupRecoveryOptions = {
  logging?: Logging;
  label?: string;
  observation?: import("../domain/observation.types.ts").ObservationHub;
};
