import type { WorkflowJson } from "./workflow/checkpoint.types.ts";

/** Raw HTTP request handed to a trigger source; header names are lowercase. */
export interface TriggerHttpRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly body: Uint8Array;
}

/** Event authenticated and normalized by a trigger source. */
export interface TriggerEvent {
  readonly source: string;
  /** Sender delivery identifier; retries of one delivery share it. */
  readonly delivery: string;
  readonly kind: string;
  readonly action?: string;
  /** Sender-authenticated identity such as `github:octocat`; not an Outpost actor. */
  readonly actor?: string;
  readonly payload: WorkflowJson;
  readonly receivedAt: string;
}

export interface TriggerReply {
  readonly status: number;
  readonly body?: string;
  readonly contentType?: string;
}

export type TriggerOutcome = "accepted" | "ignored";

/** Verifies one sender protocol; any thrown error rejects the request. */
export interface TriggerSource {
  readonly name: string;
  verify(request: TriggerHttpRequest, now: number): Promise<TriggerEvent>;
  /** Overrides the default 202/204 replies when the sender expects another status. */
  reply?(outcome: TriggerOutcome, job?: string): TriggerReply;
}

/** A secret, or a callback returning every currently accepted secret for rotation. */
export type TriggerSecret =
  string | (() => readonly string[] | Promise<readonly string[]>);
