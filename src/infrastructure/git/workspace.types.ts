import type {
  BranchPolicy,
  Disposal,
  StageLimits,
  WorkspaceRecord,
} from "../../domain/workspace.types.ts";
import type { DiffGuard } from "../../domain/diff-guard.types.ts";
import type { GuardSnapshot } from "./diff-guard.types.ts";

export interface WorkspaceLease extends WorkspaceRecord {
  checkGuard(): Promise<GuardSnapshot | undefined>;
  integrate(candidate?: IntegrationCandidate): Promise<void>;
  retain(): void;
  dispose(preserve?: boolean): Promise<Disposal>;
}

export interface AcquireWorkspaceOptions {
  readonly guard?: DiffGuard;
  readonly observation?: import("../../domain/observation.types.ts").ObservationHub;
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

export interface IntegrationCandidate {
  readonly mode: "merge" | "resolved";
  readonly record: WorkspaceRecord;
  readonly hostCommit: string;
  readonly sourceCommit: string;
  readonly commit: string;
  readonly signal: AbortSignal;
}
