import type { AgentEvent } from "../../domain/agent.types.ts";

export type ProtocolRecord = Record<string, unknown>;
export type EventDecoder = (event: ProtocolRecord) => AgentEvent[];
export type EventDecoders = Readonly<Partial<Record<string, EventDecoder>>>;
