import type { Command } from "./command.types.ts";

export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}

export type BranchPolicy =
  | { readonly mode: "current" }
  | { readonly mode: "named"; readonly name: string; readonly from?: string }
  | { readonly mode: "integrate"; readonly from?: string };

export interface WorkspaceRecord {
  readonly repository: string;
  readonly directory: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly baseline: string;
  readonly gitDirectories: readonly string[];
  readonly policy: BranchPolicy;
}

export interface Commit {
  readonly oid: string;
  readonly subject: string;
}

export interface Disposal {
  readonly retainedDirectory?: string;
}

export interface LifecycleHooks {
  readonly workspaceReady?: readonly Command[];
  readonly hostReady?: readonly Command[];
  readonly sandboxReady?: readonly Command[];
}
