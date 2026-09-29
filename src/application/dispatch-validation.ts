import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Agent } from "../domain/agent.types.ts";
import { invariant, positive } from "../domain/errors.ts";
import { validateBrief } from "../domain/prompts.ts";
import { steeringChannel } from "../domain/steering.ts";
import { dispatchDeadlines, executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions } from "./execution.types.ts";

export function validateDispatch(options: DispatchOptions<unknown>): void {
  options.signal?.throwIfAborted();
  if (options.steering) steeringChannel(options.steering);
  validateBrief(options.brief);
  positive(options.passes ?? executionDefaults.passes, "passes");
  invariant(
    Number.isSafeInteger(options.passes ?? executionDefaults.passes),
    "passes must be an integer",
  );
  for (const key of dispatchDeadlines)
    if (options[key] !== undefined) positive(options[key], key);
  if (options.response || options.continuation)
    invariant(
      (options.passes ?? executionDefaults.passes) === 1,
      "Structured responses and continuations require one pass",
    );
  const markers =
    options.until === undefined
      ? []
      : typeof options.until === "string"
        ? [options.until]
        : options.until;
  invariant(
    markers.every((marker) => marker.length > 0),
    "Completion markers cannot be empty",
  );
}

export async function preflightDispatch(
  options: DispatchOptions<unknown>,
  _repository: string,
  agent?: Agent,
): Promise<void> {
  validateDispatch(options);
  if (options.steering && agent) validateSteering(agent);
  if (options.continuation)
    invariant(
      agent?.resumable !== false,
      `${agent?.name} does not support continuation or fork in Outpost`,
    );
  if (options.continuation?.fork)
    invariant(
      agent?.forkable !== false,
      `${agent?.name} does not support automated fork in Outpost`,
    );
  if (!options.response) return;
  if (options.response.repairs > 0)
    invariant(
      agent?.resumable ?? !!agent?.storage,
      "Response repair requires an adapter that supports continuation",
    );
  const brief = options.brief;
  const text = brief.text ?? (await readFile(resolve(brief.file!), "utf8"));
  const resolved = text.replace(/\{\{\s*(\w+)\s*\}\}/g, (token, key: string) =>
    brief.values?.[key] === undefined ? token : String(brief.values[key]),
  );
  invariant(
    resolved.includes(`<${options.response.tag}>`),
    `Brief must request an opening <${options.response.tag}> tag`,
  );
}

function validateSteering(agent: Agent): void {
  invariant(
    agent.kind !== "replay",
    "Replay agents reproduce a recording and cannot be steered",
  );
  invariant(
    agent.kind === "custom" || agent.liveInput || agent.resumable,
    `${agent.name} cannot be steered: it accepts no live input and cannot resume its conversation`,
  );
}
