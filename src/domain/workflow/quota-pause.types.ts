export interface WorkflowQuotaPolicy {
  readonly action: "pause";
  /** Longest in-process wait for a known reset; later resets pause durably. */
  readonly maxWaitMs?: number;
}

export interface WorkflowQuotaPause {
  readonly requestedAt: string;
  readonly message: string;
  readonly resetAt?: string;
  /** Captured conversation of the interrupted attempt, portable to a new sandbox. */
  readonly conversation?: string;
  /** Retained work branch of the interrupted attempt. */
  readonly branch?: string;
}
