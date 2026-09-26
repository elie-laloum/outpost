import type { AgentEvent } from "../../domain/agent.types.ts";
import { decodeRecord } from "./protocol.ts";
import type { EventDecoders, ProtocolRecord } from "./protocol.types.ts";

export function decodeEvent(
  event: ProtocolRecord,
  handlers: EventDecoders,
  discriminant = "type",
): AgentEvent[] {
  const kind = event[discriminant];
  const handler =
    typeof kind === "string" && Object.hasOwn(handlers, kind)
      ? handlers[kind]
      : undefined;
  return handler?.(event) ?? [];
}

export function decodeLine(
  line: string,
  handlers: EventDecoders,
  discriminant = "type",
): AgentEvent[] {
  const event = decodeRecord(line);
  if (!event) return [{ kind: "raw", value: line }];
  const events = decodeEvent(event, handlers, discriminant);
  return events.length ? events : [{ kind: "raw", value: event }];
}
