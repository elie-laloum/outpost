export interface GuardSnapshot {
  readonly baseline: string;
  readonly candidateCommit: string;
  readonly hostCommit?: string;
}
