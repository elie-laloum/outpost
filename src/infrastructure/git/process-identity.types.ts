export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
export interface LockOwnership {
  readonly status: "active" | "inactive" | "unknown";
  readonly reason: string;
}
