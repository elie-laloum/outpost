/** How a steering message reached the agent. */
export type SteeringMode = "injected" | "resumed";

/** Lifecycle of a steering controller. */
export type SteeringState = "idle" | "active" | "closed";

export interface SteeringDelivery {
  /** `injected` joined the running turn; `resumed` continued the conversation in a new turn. */
  readonly mode: SteeringMode;
}

export interface SteeringSendOptions {
  /** Built-in subagent run id from its `subagent` event; `null` targets only the main loop. */
  readonly subagent?: string | null;
}

/** Sends instructions to the agent of the dispatch it is attached to. */
export interface Steering {
  /** `active` while a dispatch uses the controller, `closed` after close(). */
  readonly state: SteeringState;
  /** Resolves when the agent receives the text; rejects when no dispatch can deliver it. */
  send(text: string, options?: SteeringSendOptions): Promise<SteeringDelivery>;
  /** Rejects undelivered messages and every later send. */
  close(): void;
}

export interface SteeringMessage {
  readonly text: string;
  /** Undefined for any loop, null for the main loop, or a subagent run id. */
  readonly subagent?: string | null;
  deliver(delivery: SteeringDelivery): void;
}

export type SteeringFilter = (message: SteeringMessage) => boolean;

export interface PendingSteeringMessage extends SteeringMessage {
  reject(error: Error): void;
}

export interface SteeringInbox {
  count(accept?: SteeringFilter): number;
  take(accept?: SteeringFilter): readonly SteeringMessage[];
  /** Rejects matching messages with a steering error describing why. */
  reject(accept: SteeringFilter, reason: string): void;
  subscribe(listener: () => void): () => void;
}

export interface SteeringChannel {
  readonly inbox: SteeringInbox;
  open(): () => void;
}
