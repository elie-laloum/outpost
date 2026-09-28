import type { AgentEvent, AgentObservation } from "./agent.types.ts";
import type { Observation, ObservationEvent } from "./observation.types.ts";

export function isAgentEvent(event: ObservationEvent): event is AgentEvent {
  switch (event.kind) {
    case "workflow":
    case "operation":
    case "dispatch-start":
    case "dispatch-finished":
    case "workspace-commits":
    case "command-output":
    case "candidate":
    case "queue":
      return false;
    default:
      return true;
  }
}

export function agentObservation(
  value: Observation,
): AgentObservation | undefined {
  if (!isAgentEvent(value.event)) return undefined;
  return {
    ...value.event,
    pass: value.scope.pass ?? 1,
    at: value.at,
    seq: value.seq,
    source: value.source,
    scope: value.scope,
  };
}
