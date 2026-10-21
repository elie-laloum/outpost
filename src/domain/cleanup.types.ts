export type CleanupStep = () => unknown | Promise<unknown>;

export interface CleanupPolicy {
  /** Message of the aggregate error reporting execution and cleanup failures together. */
  readonly message?: string;
  /** Records cleanup failures under this recovery key and rethrows the execution failure unchanged. */
  readonly recovery?: string;
}
