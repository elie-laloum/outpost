import type { ObservationHub } from "./observation.types.ts";
import type {
  ObservationSessionFactory,
  ObservationSessionOptions,
} from "./observation-session.types.ts";

const factories = new WeakMap<ObservationHub, ObservationSessionFactory>();

export function registerObservationSessions(
  observation: ObservationHub,
  factory: ObservationSessionFactory,
): void {
  factories.set(observation, factory);
}

export function openObservationSession(
  observation: ObservationHub | undefined,
  options: ObservationSessionOptions,
) {
  return observation ? factories.get(observation)?.(options) : undefined;
}
