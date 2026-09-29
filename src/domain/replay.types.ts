import type { AgentEvent, AgentFeatures, Usage } from "./agent.types.ts";
import type { FaultCode } from "./errors.types.ts";

export interface RecordedRevision {
  readonly commit: string;
  readonly tree: string;
}

export interface RecordedIdentity {
  readonly name: string;
  readonly email: string;
  readonly date: string;
}

export interface RecordedCommit {
  readonly oid: string;
  readonly tree: string;
  readonly author: RecordedIdentity;
  readonly committer: RecordedIdentity;
  readonly message: string;
  readonly patch: string;
}

export type WorkspaceCommitsEvent =
  | {
      readonly kind: "workspace-commits";
      readonly baseline: RecordedRevision;
      readonly commits: readonly RecordedCommit[];
    }
  | {
      readonly kind: "workspace-commits";
      readonly baseline?: RecordedRevision;
      readonly unavailable: string;
    };

export interface ReplayFailure {
  readonly code: FaultCode;
  readonly message: string;
}

export type FallbackEvent = Extract<AgentEvent, { readonly kind: "fallback" }>;

export interface ReplayTurn {
  readonly prompt: string;
  readonly events: readonly AgentEvent[];
  readonly text: string;
  readonly usage: Usage;
  readonly conversation?: string;
  readonly failure?: ReplayFailure;
  /** Recorded handover of a fallback agent to its next candidate after this turn. */
  readonly handover?: FallbackEvent;
  readonly changes?: WorkspaceCommitsEvent;
}

export type ReplayDivergencePolicy = "fail" | "warn";

export type ReplayDivergenceKind =
  "prompt" | "baseline" | "tree" | "exhausted" | "unrecorded";

export interface ReplayDivergenceDetails {
  readonly kind: ReplayDivergenceKind;
  readonly turn: number;
  readonly expected?: string;
  readonly actual?: string;
  readonly commit?: string;
}

export interface ReplayAgentOptions {
  readonly journal: readonly unknown[];
  readonly divergence?: ReplayDivergencePolicy;
}

export interface ReplayAgent extends AgentFeatures {
  readonly kind: "replay";
  readonly source: "agent" | "harness";
  readonly divergence: ReplayDivergencePolicy;
  readonly turns: readonly ReplayTurn[];
  readonly remainingTurns: number;
  nextTurn(): ReplayTurn | undefined;
}

export type JournalObject = Readonly<Record<string, unknown>>;

export interface ReplayJournalEvent {
  readonly origin: unknown;
  readonly event: JournalObject & { readonly kind: string };
}

export interface ReplayRecording {
  readonly turns: readonly ReplayTurn[];
  readonly source: ReplayAgent["source"];
}

export interface DraftTurn {
  readonly prompt: string;
  readonly events: AgentEvent[];
  readonly texts: string[];
  readonly raws: string[];
  result?: string;
  conversation?: string;
  failure?: string;
  usage?: Usage;
  observed: Usage;
  handover?: FallbackEvent;
  changes?: WorkspaceCommitsEvent;
}
