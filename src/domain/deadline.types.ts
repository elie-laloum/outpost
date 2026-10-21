export interface DeadlineOptions {
  readonly parent?: AbortSignal;
  readonly durationMs?: number;
  readonly reason?: unknown;
}

export interface Deadline {
  readonly signal: AbortSignal;
  readonly expired: AbortSignal;
  close(): void;
}
