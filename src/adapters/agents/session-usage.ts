import type { Usage } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { addUsage } from "../../domain/usage.ts";
import { asRecord, decodeRecord } from "./protocol.ts";
import {
  sessionUsageLimits,
  sessionUsageScript,
} from "./session-usage.constants.ts";

export function sessionUsageCommand(
  kind: "copilot" | "kimi",
  conversation: string,
): Command | undefined {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(conversation)) return;
  return {
    executable: "node",
    arguments: [
      "-e",
      sessionUsageScript,
      kind,
      conversation,
      JSON.stringify(sessionUsageLimits),
    ],
    retain: sessionUsageLimits.outputBytes,
    deadlineMs: sessionUsageLimits.deadlineMs,
  };
}

export function usageCounts(
  input: unknown,
  output: unknown,
  cached: unknown,
  cacheCreated: unknown,
): Usage {
  const valid = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
  return {
    input: valid(input) ? input : 0,
    output: valid(output) ? output : 0,
    cached: valid(cached) ? cached : 0,
    cacheCreated: valid(cacheCreated) ? cacheCreated : 0,
    ...([input, output, cached, cacheCreated].every(valid)
      ? {}
      : { complete: false }),
  };
}

export function sessionUsageResult(
  text: string,
  decode: (value: unknown) => Usage,
): Usage | undefined {
  const result = decodeRecord(text);
  if (!result || !Array.isArray(result.records)) return;
  return result.records.reduce<Usage>(
    (total, value) => addUsage(total, decode(asRecord(value))),
    {
      input: 0,
      output: 0,
      cached: 0,
      ...(result.complete === true && result.records.length > 0
        ? {}
        : { complete: false }),
    },
  );
}
