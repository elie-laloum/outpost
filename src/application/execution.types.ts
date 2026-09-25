import type { TransportReference } from "../domain/transport.types.ts";
import type {
  AgentAdapter,
  AgentObservation,
  Usage,
} from "../domain/agent.types.ts";
import type { DispatchTelemetry } from "../domain/dispatch-telemetry.types.ts";
import type { Brief } from "../domain/prompts.types.ts";
import type { ResponseSpec } from "../domain/response.types.ts";
import type { Logging } from "../infrastructure/journal.types.ts";

export interface DispatchOptions<T = undefined> {
  readonly agent?: AgentAdapter;
  readonly logging?: Logging;
  readonly label?: string;
  readonly brief: Brief;
  readonly passes?: number;
  readonly until?: string | readonly string[];
  readonly idleMs?: number;
  readonly idleWarningMs?: number;
  readonly settleMs?: number;
  readonly deadlineMs?: number;
  readonly expansionMs?: number;
  readonly signal?: AbortSignal;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
  readonly response?: ResponseSpec<T>;
  readonly telemetry?: DispatchTelemetry;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}

export interface Turn {
  readonly text: string;
  readonly status: number;
  readonly conversation?: string;
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly usage: Usage;
  readonly durationMs: number;
}

export interface AgentOutput {
  readonly completed: boolean;
  readonly conversation: string | undefined;
  append(chunk: string): void;
  flush(): void;
  result(): Pick<Turn, "text" | "usage" | "conversation">;
}

export interface ActivityWatchdog {
  refresh(completed: boolean): void;
  close(): void;
}

export interface Execution<T> {
  readonly text: string;
  readonly turns: readonly Turn[];
  readonly usage: Usage;
  readonly conversation?: string;
  readonly value: T;
  readonly completed: boolean;
  readonly completion?: string;
}
