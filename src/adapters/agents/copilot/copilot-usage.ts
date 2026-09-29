import type { AgentEvent, Usage } from "../../../domain/agent.types.ts";
import { addUsage } from "../../../domain/usage.ts";
import { asRecord } from "../protocol.ts";
import { usageCounts } from "../session-usage.ts";

export function copilotUsage(value: unknown): Usage {
  const usage = asRecord(value);
  return usageCounts(
    usage.inputTokens,
    usage.outputTokens,
    usage.cacheReadTokens,
    usage.cacheWriteTokens,
  );
}

export function copilotShutdown(event: Record<string, unknown>): AgentEvent[] {
  const metrics = asRecord(asRecord(event.data).modelMetrics);
  const values = Object.values(metrics);
  const tokens = values.reduce<Usage>(
    (total, metric) => addUsage(total, copilotUsage(asRecord(metric).usage)),
    {
      input: 0,
      cached: 0,
      output: 0,
      ...(values.length ? {} : { complete: false }),
    },
  );
  return [{ kind: "usage", tokens, cumulative: true }];
}
