import type {
  BranchPolicy,
  Disposal,
  StageLimits,
  WorkspaceRecord,
} from "../../domain/workspace.types.ts";

export interface WorkspaceLease extends WorkspaceRecord {
  integrate(): Promise<void>;
  dispose(preserve?: boolean): Promise<Disposal>;
}

export interface AcquireWorkspaceOptions {
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
}
export interface ManagedWorktreeOptions {
  readonly repository: string;
  readonly policy: Exclude<BranchPolicy, { mode: "current" }>;
  readonly branch: string;
  readonly options: AcquireWorkspaceOptions;
}
export interface ManagedWorktree {
  readonly workdir: string;
  readonly created: boolean;
}
