import { invariant, positive } from "./errors.ts";
import {
  defaultStuckInterventions,
  maxRepetitionWindow,
} from "./watchdog.constants.ts";
import type { WatchdogOptions } from "./watchdog.types.ts";

export function validateWatchdog(options: WatchdogOptions): void {
  const { repetition, onStuck } = options;
  positive(repetition.window, "watchdog.repetition.window");
  positive(repetition.maxRepeats, "watchdog.repetition.maxRepeats");
  invariant(
    repetition.window <= maxRepetitionWindow,
    `watchdog.repetition.window must not exceed ${maxRepetitionWindow}`,
  );
  invariant(
    repetition.maxRepeats >= 2 && repetition.maxRepeats <= repetition.window,
    "watchdog.repetition.maxRepeats must be between 2 and window",
  );
  if (onStuck === "stop" || onStuck === "warn") return;
  invariant(
    onStuck && typeof onStuck === "object",
    "watchdog.onStuck must be stop, warn or an instruction policy",
  );
  invariant(
    typeof onStuck.instruction === "string" && onStuck.instruction.trim(),
    "watchdog.onStuck.instruction must be nonempty",
  );
  positive(
    onStuck.maxInterventions ?? defaultStuckInterventions,
    "watchdog.onStuck.maxInterventions",
  );
}
