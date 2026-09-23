import type { SandboxLease } from "../domain/sandbox.types.ts";
import type {
  StageLimits,
  WorkspaceRecord,
} from "../domain/workspace.types.ts";

export interface RemoteSync {
  pull(): Promise<void>;
  close(): Promise<void>;
}

export interface RemoteSyncOptions {
  readonly includeUncommitted?: boolean;
  readonly signal?: AbortSignal;
  readonly limits?: StageLimits;
}

export interface RemoteWorkspaceContext {
  readonly workspace: WorkspaceRecord;
  readonly lease: SandboxLease;
  readonly options: RemoteSyncOptions;
  readonly recovery: string;
  readonly remoteBundle: string;
  readonly run: (args: readonly string[]) => Promise<string>;
  readonly protectedFiles: readonly string[];
  readonly originalHead: string;
  readonly initialPatch: string;
  readonly initialIndex: string;
}
export interface RemoteChanges {
  readonly head: string;
  readonly patch: string;
  readonly incoming: readonly string[];
}
export interface HostBackup {
  readonly previousPatch: string;
  readonly previousExtras: readonly string[];
}
