import { toolResult } from "../tool-result.ts";
import type { AgentEvent } from "../../../domain/agent.types.ts";
import { decodeLine } from "../event-decoder.ts";
import { asRecord, numberOrZero } from "../protocol.ts";
import type { EventDecoders, ProtocolRecord } from "../protocol.types.ts";

const steps: EventDecoders = {
  agent_response: (step) =>
    typeof step.text_delta === "string" && step.text_delta
      ? [{ kind: "text", text: step.text_delta }]
      : [],
  tool: (step) => {
    if (typeof step.tool_name !== "string") return [];
    const callId =
      typeof step.step_index === "number" &&
      Number.isSafeInteger(step.step_index)
        ? `${String(step.conversation_id ?? "turn")}:${step.step_index}`
        : undefined;
    const info = asRecord(step.tool_info);
    if (step.state === "ACTIVE" && callId)
      return [
        { kind: "tool", name: step.tool_name, input: info.parameters, callId },
      ];
    if (step.state !== "DONE" && step.state !== "ERROR") return [];
    if (callId)
      return toolResult(
        callId,
        step.tool_name,
        info.result ?? info.output,
        step.state === "ERROR",
      );
    return [{ kind: "tool", name: step.tool_name, input: info.parameters }];
  },
};

function failure(result: ProtocolRecord, response: string): string {
  if (typeof result.error === "string" && result.error) return result.error;
  if (result.status === "SUCCESS" && !response.trim())
    return "Antigravity returned an empty response";
  return `Antigravity ended the turn with status ${String(result.status ?? "unknown")}`;
}

function result(event: ProtocolRecord): AgentEvent[] {
  const result = asRecord(event.result);
  const usage = asRecord(result.usage);
  const response = typeof result.response === "string" ? result.response : "";
  const events: AgentEvent[] = Object.keys(usage).length
    ? [
        {
          kind: "usage",
          tokens: {
            input: numberOrZero(usage.input_tokens),
            cached: numberOrZero(usage.cache_read_tokens),
            output:
              numberOrZero(usage.output_tokens) +
              numberOrZero(usage.thinking_tokens),
          },
        },
      ]
    : [];
  if (result.status === "SUCCESS" && response.trim())
    return [
      ...events,
      { kind: "result", text: response },
      { kind: "finished" },
    ];
  return [...events, { kind: "failure", message: failure(result, response) }];
}

export function antigravityEvents(line: string): AgentEvent[] {
  return decodeLine(
    line,
    {
      init: (event) =>
        typeof event.conversation_id === "string"
          ? [{ kind: "conversation", id: event.conversation_id }]
          : [],
      step_update: (event) => {
        const step = asRecord(event.step_update);
        const decode =
          typeof step.step_type === "string" &&
          Object.hasOwn(steps, step.step_type)
            ? steps[step.step_type]
            : undefined;
        return decode?.(step) ?? [];
      },
      result,
    },
    "event",
  );
}
