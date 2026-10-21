export interface DeadlineOptions {
  readonly parent?: AbortSignal;
  readonly durationMs?: number;
  readonly reason?: unknown;
}
