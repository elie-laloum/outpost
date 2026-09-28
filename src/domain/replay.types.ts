export interface RecordedRevision {
  readonly commit: string;
  readonly tree: string;
}

export interface RecordedIdentity {
  readonly name: string;
  readonly email: string;
  readonly date: string;
}

export interface RecordedCommit {
  readonly oid: string;
  readonly tree: string;
  readonly author: RecordedIdentity;
  readonly committer: RecordedIdentity;
  readonly message: string;
  readonly patch: string;
}

export type WorkspaceCommitsEvent =
  | {
      readonly kind: "workspace-commits";
      readonly baseline: RecordedRevision;
      readonly commits: readonly RecordedCommit[];
    }
  | {
      readonly kind: "workspace-commits";
      readonly baseline?: RecordedRevision;
      readonly unavailable: string;
    };
