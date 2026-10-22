import type { Observation } from "./types.ts";

/** Event kinds too chatty for the run log; their complete form follows. */
const hidden = new Set(["text-delta", "message-usage", "step"]);
const details = ["text", "message", "preview", "reason", "name", "status"];

/** One readable log line for an observation, or undefined to leave it out. */
export function observationText(observation: Observation): string | undefined {
  const { event } = observation;
  if (event.kind === "workflow") {
    const { type, key, status, error } = event.event;
    if (type === "checkpoint") return undefined;
    const line = [type, key, status && `→ ${status}`].filter(Boolean).join(" ");
    return error ? `${line}: ${error}` : line;
  }
  if (hidden.has(event.kind)) return undefined;
  const detail = Object.entries(event).find(
    ([name, value]) => details.includes(name) && typeof value === "string",
  )?.[1] as string | undefined;
  if (event.kind === "command-output") return detail?.trimEnd();
  return detail ? `${event.kind}: ${detail.trimEnd()}` : event.kind;
}
