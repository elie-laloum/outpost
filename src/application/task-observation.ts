import { createObservationHub } from "../domain/observation.ts";
import { agentObservation } from "../domain/agent-observation.ts";
import type { AgentObservation } from "../domain/agent.types.ts";
import type {
  ObservationHub,
  ObservationScope,
} from "../domain/observation.types.ts";

export function taskObservation(
  parent: ObservationHub | undefined,
  observe: ((event: AgentObservation) => void) | undefined,
  scope: ObservationScope = {},
): ObservationHub {
  return (parent ?? createObservationHub()).child(scope, [
    {
      observe(value) {
        if (value.source !== "agent" && value.source !== "harness") return;
        const event = agentObservation(value);
        if (event) return observe?.(event);
      },
      async flush() {
        if (
          observe &&
          "flush" in observe &&
          typeof observe.flush === "function"
        )
          await observe.flush();
      },
    },
  ]);
}
