import { createHash } from "node:crypto";
import { OutpostError } from "../domain/errors.ts";
import { defaultStuckInterventions } from "../domain/watchdog.constants.ts";
import { canonicalJson } from "../domain/workflow/canonical-json.ts";
import { checkpointValue } from "../domain/workflow/checkpoint-value.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type {
  RepetitionActivity,
  RepetitionEntry,
  RepetitionWatchdog,
} from "./repetition-watchdog.types.ts";
import { notify } from "./observation.ts";

export function repetitionWatchdog(
  options: DispatchOptions<unknown>,
): RepetitionWatchdog {
  const policy = options.watchdog;
  let entries: RepetitionEntry[] = [];
  let interventions = 0;
  let pending = false;
  let stopped = false;
  let pass: number | undefined;
  let deliveryFailure: OutpostError | undefined;
  return {
    finish() {
      if (deliveryFailure) throw deliveryFailure;
      if (pending)
        throw new OutpostError(
          "steering",
          "The dispatch ended before the watchdog instruction was delivered",
        );
    },
    observe(event, controller) {
      if (
        !policy ||
        stopped ||
        pending ||
        controller.signal.aborted ||
        options.signal?.aborted
      )
        return;
      if (event.kind !== "tool" && event.kind !== "file-change") return;
      if (pass !== event.pass) entries = [];
      pass = event.pass;
      const scope =
        event.subagentId ??
        (event.kind === "tool" ? event.parentCallId : undefined) ??
        "";
      const identity =
        event.callId === undefined
          ? undefined
          : JSON.stringify([scope, event.kind, event.callId]);
      if (identity && entries.some((entry) => entry.identity === identity))
        return;
      const fingerprint = activityFingerprint(event, scope);
      entries.push({ fingerprint, ...(identity ? { identity } : {}) });
      if (entries.length > policy.repetition.window) entries.shift();
      if (!fingerprint) return;
      const repeats = entries.filter(
        (entry) => entry.fingerprint === fingerprint,
      ).length;
      if (repeats < policy.repetition.maxRepeats) return;
      const instruction =
        typeof policy.onStuck === "object" ? policy.onStuck : undefined;
      let action: "stop" | "warn" | "steer" = "stop";
      if (policy.onStuck === "warn") action = "warn";
      if (
        instruction &&
        interventions <
          (instruction.maxInterventions ?? defaultStuckInterventions)
      )
        action = "steer";
      const stuck = {
        kind: "stuck" as const,
        activity: event.kind,
        ...(event.kind === "tool" ? { name: event.name } : {}),
        repeats,
        window: policy.repetition.window,
        action,
        ...(event.subagentId ? { subagentId: event.subagentId } : {}),
        pass: event.pass,
        at: event.at,
      };
      entries = [];
      notify(options.observe, stuck);
      const message = `Agent repeated the same ${event.kind}${event.kind === "tool" ? ` (${event.name})` : ""} ${repeats} times in its activity window`;
      if (action === "warn") {
        notify(options.observe, {
          kind: "warning",
          message,
          pass: event.pass,
          at: event.at,
        });
        return;
      }
      if (action === "stop") {
        stopped = true;
        controller.abort(
          new OutpostError("stuck", message, { ...stuck, stopReason: "stuck" }),
        );
        return;
      }
      interventions++;
      pending = true;
      const delivery = options.steering!.send(
        instruction!.instruction,
        event.subagentId ? { subagent: event.subagentId } : {},
      );
      void delivery.then(
        () => {
          pending = false;
        },
        (cause: unknown) => {
          pending = false;
          stopped = true;
          deliveryFailure = new OutpostError(
            "steering",
            "Watchdog instruction could not be delivered",
            {},
            cause,
          );
          controller.abort(deliveryFailure);
        },
      );
    },
  };
}

function activityFingerprint(event: RepetitionActivity, scope: string): string {
  try {
    const value = checkpointValue(
      event.kind === "tool" ? event.input : event.changes,
    );
    return createHash("sha256")
      .update(
        canonicalJson([
          scope,
          event.kind,
          event.kind === "tool" ? event.name : "",
          value.kind,
          value.kind === "json" ? value.value : null,
        ]),
      )
      .digest("hex");
  } catch {
    return "";
  }
}
