/** How a steering message reached the agent. */
export type SteeringMode = "injected" | "resumed";

/** Lifecycle of a steering controller. */
export type SteeringState = "idle" | "active" | "closed";

export interface SteeringDelivery {
  /** `injected` joined the running turn; `resumed` continued the conversation in a new turn. */
  readonly mode: SteeringMode;
}

/** Sends instructions to the agent of the dispatch it is attached to. */
export interface Steering {
  /** `active` while a dispatch uses the controller, `closed` after close(). */
  readonly state: SteeringState;
  /** Resolves when the agent receives the text; rejects when no dispatch can deliver it. */
  send(text: string): Promise<SteeringDelivery>;
  /** Rejects undelivered messages and every later send. */
  close(): void;
}

export interface SteeringMessage {
  readonly text: string;
  deliver(delivery: SteeringDelivery): void;
}

export interface PendingSteeringMessage extends SteeringMessage {
  reject(error: Error): void;
}

export interface SteeringInbox {
  readonly size: number;
  take(): readonly SteeringMessage[];
  subscribe(listener: () => void): () => void;
}

export interface SteeringChannel {
  readonly inbox: SteeringInbox;
  open(): () => void;
}
