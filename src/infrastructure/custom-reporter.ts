import { agentObservation } from "../domain/agent-observation.ts";
import { createObservationHub } from "../domain/observation.ts";
import type { AgentObservation } from "../domain/agent.types.ts";
import type {
  CustomReporter,
  CustomReporterOptions,
  ReporterHandlers,
} from "./custom-reporter.types.ts";

export function createReporter(
  handlers: ReporterHandlers,
  options: CustomReporterOptions = {},
): CustomReporter {
  const hub = createObservationHub({
    ...(options.capacity === undefined ? {} : { capacity: options.capacity }),
    ...(options.deliveryTimeoutMs === undefined
      ? {}
      : { deliveryTimeoutMs: options.deliveryTimeoutMs }),
    sinks: [
      {
        async observe(value) {
          const event = agentObservation(value);
          if (!event) return;
          const handler = handlers[event.kind] as
            ((event: AgentObservation) => void | Promise<void>) | undefined;
          try {
            await handler?.(event);
          } catch (error) {
            try {
              await options.onError?.(error, event);
            } catch {}
            throw error;
          }
        },
      },
    ],
  });
  const report = (event: AgentObservation): void => {
    hub.child({ pass: event.pass }).emit("agent", event);
  };
  return Object.assign(report, {
    async flush() {
      await hub.flush();
      if (hub.errors.length) throw hub.errors[0];
    },
  });
}
