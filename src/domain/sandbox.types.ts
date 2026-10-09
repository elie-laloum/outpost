import type { Command, CommandResult, Variables } from "./command.types.ts";
import type {
  FileWorkspaceRecord,
  WorkspaceRuntime,
} from "./file-workspace.types.ts";

export interface FileSandboxContext {
  readonly workspace: FileWorkspaceRecord;
  readonly runtime: WorkspaceRuntime;
  readonly variables: Variables;
  readonly signal?: AbortSignal;
  readonly registerRecovery?: (resourceId: string) => Promise<void>;
}

export interface SandboxWorkspaces {
  readonly bindings: readonly (
    "copy" | "ephemeral" | "mount-readonly" | "mount-write"
  )[];
  acquire(context: FileSandboxContext): Promise<SandboxLease>;
}

export interface Volume {
  readonly source: string;
  readonly target: string;
  readonly readOnly?: boolean;
}

export interface SandboxContext {
  readonly workspaceIdentity?: string;
  readonly registerRecovery?: (resourceId: string) => Promise<void>;
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}

export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}

export interface FileManifestEntry {
  readonly path: string;
  readonly kind: "file" | "link";
  readonly mode: number;
  readonly size: number;
  readonly sha256: string;
}

export interface FileTransfers {
  uploadBatch?(
    source: string,
    entries: readonly FileManifestEntry[],
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  manifest(
    source: string,
    paths: readonly string[],
    options?: TransferOptions,
  ): Promise<readonly FileManifestEntry[]>;
  downloadBatch(
    source: string,
    entries: readonly FileManifestEntry[],
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
}

export interface SandboxLease {
  readonly fileTransfers?: FileTransfers;
  /** Whether invoke accepts Command.input as live stdin for a running process. */
  readonly liveInput?: boolean;
  readonly root: string;
  readonly home: string;
  invoke(command: Command): Promise<CommandResult>;
  upload(
    source: string,
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  download(
    source: string,
    destination: string,
    options?: TransferOptions,
  ): Promise<void>;
  release(): Promise<void>;
}

export interface SandboxProvider {
  readonly workspaces?: SandboxWorkspaces;
  readonly recover?: (
    resourceId: string,
    options?: TransferOptions,
  ) => Promise<void>;
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
