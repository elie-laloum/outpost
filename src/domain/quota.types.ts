export interface QuotaFault {
  readonly message: string;
  /** ISO timestamp when the provider reported that the limit resets. */
  readonly resetAt?: string;
  /** Agent conversation interrupted by the limit, when the CLI reported one. */
  readonly conversation?: string;
}
