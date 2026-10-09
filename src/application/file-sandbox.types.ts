import type {
  FileWorkspaceSource,
  WorkspaceOutputOptions,
  WorkspacePublication,
  FileWorkspaceRecord,
} from "../domain/file-workspace.types.ts";
import type {
  Command,
  CommandResult,
  Variables,
} from "../domain/command.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { Disposal } from "../domain/workspace.types.ts";
import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { DispatchOptions, Execution } from "./execution.types.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
} from "./file-workspace.types.ts";
import type { AttachOptions } from "./outpost.types.ts";

export interface FileSandboxSettings {
  readonly hooks?: import("../domain/workspace.types.ts").LifecycleHooks;
  readonly limits?: Pick<
    import("../domain/workspace.types.ts").StageLimits,
    "copyMs" | "collectMs"
  >;
  readonly observation?: import("../domain/observation.types.ts").ObservationHub;
  readonly logging?: import("../infrastructure/journal.types.ts").Logging;
  readonly activityTransport?: import("../domain/transport.types.ts").Transport;
  readonly recoveryTransport?: import("../domain/transport.types.ts").Transport;
  readonly sandboxProvider: SandboxProvider;
  readonly agent?: DispatchAgent;
  readonly signal?: AbortSignal;
  readonly variables?: Variables;
}

export type FileSandboxOptions = FileSandboxSettings &
  (
    | { readonly workspace: FileWorkspace; readonly workspaceSource?: never }
    | (Omit<FileWorkspaceOptions, "source"> & {
        readonly workspaceSource: FileWorkspaceSource;
        readonly workspace?: never;
      })
  );

export interface FileDispatchResult<T> extends Execution<T> {
  readonly logReference?: import("../domain/transport.types.ts").TransportReference;
  readonly observerErrors?: readonly unknown[];
  readonly transcript?: string;
  readonly transcriptReference?: import("../domain/transport.types.ts").TransportReference;
  readonly fallback?: import("../domain/fallback-agent.types.ts").FallbackRecord;
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly directory: string;
  readonly fileOutputs: readonly WorkspacePublication[];
  report(
    options?: import("../domain/run-report.types.ts").RunReportOptions,
  ): string;
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<FileDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<FileDispatchResult<U>>;
}

export interface FileAttachResult extends CommandResult {
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly directory: string;
}

export interface FileSandbox {
  diagnose(
    options?: import("./doctor-sandbox.types.ts").SandboxDiagnosticOptions,
  ): Promise<import("./doctor-sandbox.types.ts").SandboxDiagnosticReport>;
  readonly workspace: FileWorkspace;
  readonly root: string;
  command(command: Command): Promise<CommandResult>;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<FileDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<FileAttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}

export type FileDispatchRequest<T> = FileSandboxOptions &
  DispatchOptions<T> & {
    readonly agent: DispatchAgent;
    readonly outputs?: readonly WorkspaceOutputOptions[];
  };
