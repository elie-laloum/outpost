export interface DeadlineOptions {
  readonly parent?: AbortSignal;
  readonly durationMs?: number;
  readonly reason?: unknown;
}

export interface Deadline {
  readonly signal: AbortSignal;
  readonly expired: AbortSignal;
  /** A reason also aborts the signal, stopping work still bound to it. */
  close(reason?: unknown): void;
}
