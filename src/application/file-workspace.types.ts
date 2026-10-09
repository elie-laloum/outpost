import type {
  WorkspaceOptions,
  Workspace,
  SandboxOptions,
} from "./outpost.types.ts";
import type {
  FileWorkspaceSource,
  GitWorkspaceSource,
  WorkspaceRetention,
  WorkspaceRuntimeOptions,
  WorkspaceSession,
  FileWorkspaceRecord,
  WorkspaceFileEntry,
  WorkspaceOutputOptions,
  WorkspaceInput,
} from "../domain/file-workspace.types.ts";

export interface FileWorkspaceOptions {
  readonly hooks?: import("../domain/workspace.types.ts").LifecycleHooks;
  readonly storageQuota?: Omit<
    import("../infrastructure/storage-reservations.types.ts").StorageReservationOptions,
    "signal"
  >;
  readonly recovery?: FileWorkspaceRecoveryAuthorization;
  readonly inputs?: readonly WorkspaceInput[];
  readonly source: FileWorkspaceSource;
  readonly runtime?: WorkspaceRuntimeOptions;
  readonly paths?: readonly string[];
  readonly retention?: WorkspaceRetention;
  readonly signal?: AbortSignal;
}

export type FileWorkspaceRegistration = (
  record: FileWorkspaceRecord,
) => Promise<void>;

export interface GitWorkspaceOptions extends Omit<
  WorkspaceOptions,
  "repository" | "branch" | "copies" | "guard"
> {
  readonly source: GitWorkspaceSource;
}

export interface GitWorkspaceSandboxOptions extends Omit<
  SandboxOptions,
  "repository" | "branch" | "copies" | "guard" | "workspace"
> {
  readonly workspaceSource: GitWorkspaceSource;
  readonly workspace?: never;
  readonly repository?: never;
  readonly branch?: never;
  readonly copies?: never;
  readonly guard?: never;
}

export type GitDispatchRequest<T = undefined> = GitWorkspaceSandboxOptions &
  import("./execution.types.ts").DispatchOptions<T> & {
    readonly agent: import("../domain/fallback-agent.types.ts").DispatchAgent;
  };

export interface FileWorkspace extends WorkspaceSession {
  readonly kind: "directory" | "ephemeral";
  readonly source: FileWorkspaceSource;
  checkpoint(): Promise<FileWorkspaceRecord>;
  sandbox(
    options: import("./file-sandbox.types.ts").FileSandboxSettings,
  ): Promise<import("./file-sandbox.types.ts").FileSandbox>;
  dispatch<T = undefined>(
    options: import("./file-sandbox.types.ts").FileSandboxSettings &
      import("./execution.types.ts").DispatchOptions<T> & {
        readonly agent: import("../domain/fallback-agent.types.ts").DispatchAgent;
      },
  ): Promise<import("./file-sandbox.types.ts").FileDispatchResult<T>>;
}

export type CreatedWorkspace = GitWorkspace | FileWorkspace;

export interface FileWorkspaceRecoveryAuthorization {
  readonly expectedRevision: string;
  readonly processesStopped: true;
  readonly allocationReleased?: true;
  readonly adoptInterruptedFiles?: boolean;
  readonly adoptMountedSource?: boolean;
}

export interface GitWorkspace extends Workspace, WorkspaceSession {
  readonly kind: "git";
  readonly git: Workspace;
}

export interface FileWorkspaceState {
  readonly options: FileWorkspaceOptions;
  readonly marker: string;
  readonly inputs: readonly WorkspaceFileEntry[];
  readonly releaseSource: () => Promise<void>;
  readonly suspendSourceForPublication?: () => Promise<() => Promise<void>>;
  readonly publications: Map<
    string,
    {
      readonly options: WorkspaceOutputOptions;
      readonly expected: readonly WorkspaceFileEntry[];
    }
  >;
  active: boolean;
  closed: boolean;
  disposal?: import("../domain/workspace.types.ts").Disposal;
  generation: number;
  record: FileWorkspaceRecord;
  readonly recordTransport: import("../domain/transport.types.ts").Transport;
  recordRevision?: string;
}

export interface RestoreFileWorkspaceOptions {
  readonly runtime?: WorkspaceRuntimeOptions;
  readonly retention?: WorkspaceRetention;
  readonly portable?: boolean;
  readonly recover?: {
    readonly processesStopped: true;
    readonly expectedRevision?: string;
    readonly allocationReleased?: true;
    readonly adoptInterruptedFiles?: boolean;
    readonly adoptMountedSource?: boolean;
  };
}
