import type { AgentEvent } from "../../domain/agent.types.ts";
import { decodeRecord } from "./protocol.ts";
import type { EventDecoders, ProtocolRecord } from "./protocol.types.ts";

export function decodeEvent(
  event: ProtocolRecord,
  handlers: EventDecoders,
): AgentEvent[] {
  const handler =
    typeof event.type === "string" && Object.hasOwn(handlers, event.type)
      ? handlers[event.type]
      : undefined;
  return handler?.(event) ?? [];
}

export function decodeLine(
  line: string,
  handlers: EventDecoders,
): AgentEvent[] {
  const event = decodeRecord(line);
  if (!event) return [{ kind: "raw", value: line }];
  const events = decodeEvent(event, handlers);
  return events.length ? events : [{ kind: "raw", value: event }];
}
