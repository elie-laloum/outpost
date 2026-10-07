import type { AgentEvent } from "./agent.types.ts";
import type { WorkflowEvent } from "./workflow.types.ts";
import type { WorkspaceCommitsEvent } from "./replay.types.ts";
import type { DecisionEvent } from "./decision.types.ts";

export interface ObservationScope {
  readonly executionId?: string;
  readonly taskKey?: string;
  readonly attempt?: number;
  readonly dispatchId?: string;
  readonly pass?: number;
  readonly subagentId?: string;
  readonly candidate?: string;
}

export type ObservationSource =
  | "decision"
  | "agent"
  | "harness"
  | "workflow"
  | "sandbox"
  | "git"
  | "hooks"
  | "transfer"
  | "conversation"
  | "recovery";

export interface OperationEvent {
  readonly kind: "operation";
  readonly id: string;
  readonly name: string;
  readonly status: "started" | "finished" | "failed";
  readonly durationMs?: number;
}

export type ObservationEvent =
  | DecisionEvent
  | { readonly kind: "decision-request"; readonly request: unknown }
  | { readonly kind: "decision-response"; readonly response: unknown }
  | AgentEvent
  | OperationEvent
  | { readonly kind: "dispatch-start" }
  | {
      readonly kind: "workflow";
      readonly event: WorkflowEvent;
    }
  | {
      readonly kind: "dispatch-finished";
      readonly status: "done" | "failed" | "cancelled";
      readonly completed: boolean;
      readonly branch?: string;
      readonly commits?: readonly import("./workspace.types.ts").Commit[];
      readonly usage: import("./agent.types.ts").Usage;
      readonly error?: { readonly code?: string; readonly message: string };
    }
  | WorkspaceCommitsEvent
  | {
      readonly kind: "command-output";
      readonly channel: "stdout" | "stderr";
      readonly text: string;
    }
  | {
      readonly kind: "candidate";
      readonly status: "validated" | "accepted" | "rejected" | "cleanup";
    }
  | {
      readonly kind: "queue";
      readonly id: string;
      readonly status: "enqueued" | "polled" | "completed" | "failed";
    };

export interface Observation {
  readonly seq: number;
  readonly at: string;
  readonly source: ObservationSource;
  readonly scope: ObservationScope;
  readonly event: ObservationEvent;
}

export interface ObservationSink {
  observe(observation: Observation): void | Promise<void>;
  flush?(): void | Promise<void>;
}

export interface ObservationHubOptions {
  readonly redact?: readonly RegExp[];
  readonly sinks?: readonly ObservationSink[];
  readonly scope?: ObservationScope;
  readonly capacity?: number;
  readonly deliveryTimeoutMs?: number;
  readonly verbose?: boolean;
}

export interface ObservationHub {
  readonly redacting: boolean;
  readonly scope: ObservationScope;
  readonly errors: readonly unknown[];
  readonly dropped: number;
  readonly verbose: boolean;
  redact<T>(value: T): T;
  emit(source: ObservationSource, event: ObservationEvent): void;
  child(
    scope: ObservationScope,
    sinks?: readonly ObservationSink[],
    redact?: readonly RegExp[],
  ): ObservationHub;
  flush(): Promise<void>;
  close(): Promise<void>;
}

export interface SinkDelivery {
  readonly sink: ObservationSink;
  readonly queue: Observation[];
  completedSeq?: number;
  pendingSeq?: number;
  disabled?: boolean;
  pending?: Promise<void>;
  dropped: number;
}

export interface PendingObservation {
  readonly targets: readonly SinkDelivery[];
  readonly observation: Observation;
}
