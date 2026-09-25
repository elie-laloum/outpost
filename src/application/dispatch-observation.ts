import type { Usage } from "../domain/agent.types.ts";
import type { DispatchTelemetrySession } from "../domain/dispatch-telemetry.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import type { ObservedDispatchResult } from "./dispatch-observation.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";

export function observeDispatch<T, R extends ObservedDispatchResult>(
  options: DispatchOptions<T>,
  action: (options: DispatchOptions<T>) => Promise<R>,
): Promise<R> {
  if (!options.telemetry) return action(options);
  let session: DispatchTelemetrySession | undefined;
  notify(() => {
    session = options.telemetry?.startDispatch();
  }, undefined);
  const empty = (): Usage => ({ input: 0, cached: 0, output: 0 });
  let previous = empty(),
    current = empty();
  const { telemetry: _telemetry, ...settings } = options;
  const observed: DispatchOptions<T> = {
    ...settings,
    observe(event) {
      if (event.kind === "phase" && event.name === "preparing prompt") {
        previous = addUsage(previous, current);
        current = empty();
      }
      if (event.kind === "usage") current = addUsage(current, event.tokens);
      if (event.kind === "summary") current = event.tokens;
      notify(options.observe, event);
    },
  };
  return settle();

  async function settle(): Promise<R> {
    try {
      const result = await action(observed);
      notify(
        () =>
          session?.finish({
            status: "done",
            usage: result.usage,
            completed: result.completed,
          }),
        undefined,
      );
      return result;
    } catch (error) {
      const cancelled =
        (options.signal?.aborted && error === options.signal.reason) ||
        (error instanceof OutpostError && error.code === "aborted") ||
        (error instanceof Error && error.name === "AbortError");
      notify(
        () =>
          session?.finish({
            status: cancelled ? "cancelled" : "failed",
            usage: addUsage(previous, current),
          }),
        undefined,
      );
      throw error;
    }
  }
}
