import type { WatchdogOptions } from "../domain/watchdog.types.ts";
import type { RepetitionWatchdog } from "./repetition-watchdog.types.ts";
import type { ModelPriceTable } from "../domain/pricing.types.ts";
import type { QuotaFault } from "../domain/quota.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { TransportReference } from "../domain/transport.types.ts";
import type { AgentObservation, Usage } from "../domain/agent.types.ts";
import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { DispatchTelemetry } from "../domain/dispatch-telemetry.types.ts";
import type { Brief } from "../domain/prompts.types.ts";
import type { ResponseSpec } from "../domain/response.types.ts";
import type { Logging } from "../infrastructure/journal.types.ts";
import type { Steering } from "../domain/steering.types.ts";

export interface DispatchOptions<T = undefined> {
  readonly watchdog?: WatchdogOptions;
  readonly prices?: ModelPriceTable;
  readonly redact?: readonly RegExp[];
  readonly observation?: ObservationHub;
  readonly agent?: DispatchAgent;
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
  /** Controller from createSteering() that sends instructions while the agent runs. */
  readonly steering?: Steering;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
  readonly response?: ResponseSpec<T>;
  readonly telemetry?: DispatchTelemetry;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}

export interface TurnContext {
  readonly repetition?: RepetitionWatchdog;
  readonly repository: string;
  readonly repair: boolean;
}

export interface Turn {
  readonly text: string;
  readonly status: number;
  /** Set when steering stopped this turn to resume the conversation with new instructions. */
  readonly interrupted?: "steering";
  readonly conversation?: string;
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly usage: Usage;
  readonly durationMs: number;
}

export interface AgentOutput {
  readonly usage: Usage;
  readonly reportedUsage: boolean;
  readonly finalUsage: boolean;
  recordUsage(tokens: Usage, cumulative?: boolean): void;
  setUsageBaseline(tokens: Usage | undefined): void;
  readonly failure: string | undefined;
  readonly quota: QuotaFault | undefined;
  readonly completed: boolean;
  readonly conversation: string | undefined;
  append(chunk: string): void;
  flush(): void;
  result(): Pick<Turn, "text" | "usage" | "conversation">;
  partial(): Pick<Turn, "text" | "usage" | "conversation">;
}

export interface ActivityWatchdog {
  observe(event: AgentObservation): void;
  refresh(completed: boolean): void;
  hold(): () => void;
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
