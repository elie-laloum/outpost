import { observationSessionFactory } from "./observation-session.constants.ts";
import type { ObservationHub } from "./observation.types.ts";
import type {
  ObservationSessionCapability,
  ObservationSessionOptions,
} from "./observation-session.types.ts";

export function openObservationSession(
  observation: (ObservationHub & ObservationSessionCapability) | undefined,
  options: ObservationSessionOptions,
) {
  return observation?.[observationSessionFactory]?.(options);
}
