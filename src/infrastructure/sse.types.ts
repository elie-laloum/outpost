export interface ServerSentEvent {
  readonly event?: string;
  readonly data: string;
}
