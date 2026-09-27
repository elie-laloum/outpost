import type { AgentEvent } from "../domain/agent.types.ts";

export type AgentStopReason = Extract<
  AgentEvent,
  { kind: "stopped" }
>["reason"];
