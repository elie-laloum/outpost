export interface WorkflowQuotaPolicy {
  readonly action: "pause";
  /** Longest in-process wait for a known reset; later resets pause durably. */
  readonly maxWaitMs?: number;
}

export interface WorkflowQuotaPause {
  readonly requestedAt: string;
  readonly message: string;
  readonly resetAt?: string;
}
