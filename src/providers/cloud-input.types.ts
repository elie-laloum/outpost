export interface CloudInputFeed {
  /** Stops forwarding and waits for appends already started. */
  finish(): Promise<void>;
}
