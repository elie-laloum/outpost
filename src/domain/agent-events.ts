import type { AgentEvent, AgentEventHandlers } from "./agent.types.ts";

export function visitAgentEvent(
  event: AgentEvent,
  handlers: AgentEventHandlers,
): void {
  const handler = handlers[event.kind] as
    ((event: AgentEvent) => void) | undefined;
  handler?.(event);
}
