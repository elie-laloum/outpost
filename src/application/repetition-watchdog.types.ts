import type { AgentObservation } from "../domain/agent.types.ts";

export interface RepetitionWatchdog {
  finish(): void;
  observe(event: AgentObservation, controller: AbortController): void;
}

export interface RepetitionEntry {
  readonly fingerprint: string;
  readonly identity?: string;
}

export type RepetitionActivity = Extract<
  AgentObservation,
  { kind: "tool" | "file-change" }
>;
