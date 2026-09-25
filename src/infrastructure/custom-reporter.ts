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
  let pending = Promise.resolve();
  let failed = false;
  let failure: unknown;
  const report = (event: AgentObservation): void => {
    const handler = handlers[event.kind] as
      ((event: AgentObservation) => void | Promise<void>) | undefined;
    if (!handler) return;
    pending = pending.then(async () => {
      try {
        await handler(event);
      } catch (error) {
        if (!failed) {
          failed = true;
          failure = error;
        }
        try {
          await options.onError?.(error, event);
        } catch {}
      }
    });
  };
  return Object.assign(report, {
    async flush() {
      await pending;
      if (failed) throw failure;
    },
  });
}
