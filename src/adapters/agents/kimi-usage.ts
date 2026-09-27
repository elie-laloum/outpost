import type { Usage } from "../../domain/agent.types.ts";
import { asRecord } from "./protocol.ts";
import { usageCounts } from "./session-usage.ts";

export function kimiUsage(value: unknown): Usage {
  const usage = asRecord(value);
  return usageCounts(
    usage.inputOther,
    usage.output,
    usage.inputCacheRead,
    usage.inputCacheCreation,
  );
}
