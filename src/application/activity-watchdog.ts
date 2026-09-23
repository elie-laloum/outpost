import { OutpostError } from "../domain/errors.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { ActivityWatchdog, DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";

export function activityWatchdog(
  controller: AbortController,
  options: DispatchOptions<unknown>,
  pass: number,
): ActivityWatchdog {
  let idle: NodeJS.Timeout | undefined, settle: NodeJS.Timeout | undefined;
  let lastActivity = Date.now();
  const refresh = (completed: boolean) => {
    lastActivity = Date.now();
    clearTimeout(idle);
    clearTimeout(settle);
    if (!completed)
      idle = setTimeout(
        () =>
          controller.abort(
            new OutpostError(
              "timeout",
              "Agent produced no output before the idle deadline",
            ),
          ),
        options.idleMs ?? executionDefaults.idleMs,
      );
    if (completed)
      settle = setTimeout(
        () => controller.abort("completion"),
        options.settleMs ?? executionDefaults.settleMs,
      );
  };

  const warningInterval =
    options.idleWarningMs ?? executionDefaults.idleWarningMs;
  const warnings = setInterval(() => {
    if (Date.now() - lastActivity >= warningInterval) {
      const message = `Agent has been idle for ${Math.floor((Date.now() - lastActivity) / 1000)} seconds`;
      notify(options.warn, message);
      notify(options.observe, {
        kind: "warning",
        message,
        pass,
        at: new Date().toISOString(),
      });
    }
  }, warningInterval);

  return {
    refresh,
    close() {
      clearTimeout(idle);
      clearTimeout(settle);
      clearInterval(warnings);
    },
  };
}
