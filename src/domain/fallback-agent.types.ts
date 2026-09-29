import type { Agent } from "./agent.types.ts";

/** Failure category that lets a fallback agent move to its next candidate. */
export type FallbackTrigger = "quota" | "unavailable";

export interface FallbackAgentOptions {
  /** Failure categories that hand the dispatch to the next candidate. */
  readonly on: readonly FallbackTrigger[];
}

export interface FallbackAgent {
  readonly kind: "fallback";
  /** Candidates in the order they are tried. */
  readonly agents: readonly Agent[];
  readonly on: readonly FallbackTrigger[];
}

/** A single agent, or an ordered fallback list, accepted by dispatch. */
export type DispatchAgent = Agent | FallbackAgent;

export interface FallbackCandidate {
  /** Zero-based position in FallbackAgent.agents. */
  readonly index: number;
  readonly name: string;
  readonly model?: string;
}

export interface FallbackAttempt extends FallbackCandidate {
  readonly failure: FallbackTrigger;
  readonly message: string;
  readonly resetAt?: string;
}

export interface FallbackRecord {
  /** Candidate that produced the dispatch result. */
  readonly selected: FallbackCandidate;
  /** Candidates that failed before it, in order. */
  readonly attempts: readonly FallbackAttempt[];
}

export interface FallbackFailure {
  readonly failure: FallbackTrigger;
  readonly message: string;
  readonly resetAt?: string;
}
