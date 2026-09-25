import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import type { AgentAdapter } from "../domain/agent.types.ts";
import type { Command, CommandResult } from "../domain/command.types.ts";
import type { Brief } from "../domain/prompts.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type {
  BranchPolicy,
  Commit,
  Disposal,
  LifecycleHooks,
  StageLimits,
  WorkspaceRecord,
} from "../domain/workspace.types.ts";
import type { StorageReservationOptions } from "../infrastructure/storage-reservations.types.ts";
import type { Logging } from "../infrastructure/journal.types.ts";
import type {
  SandboxDiagnosticOptions,
  SandboxDiagnosticReport,
} from "./doctor-sandbox.types.ts";
import type { DispatchOptions, Execution } from "./execution.types.ts";
import type { VariableQuestion } from "./interactive-brief.types.ts";

export interface WorkspaceOptions {
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
  readonly signal?: AbortSignal;
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
  readonly hooks?: LifecycleHooks;
}

export interface Workspace extends WorkspaceRecord {
  dispatch<T = undefined>(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      DispatchOptions<T> & { readonly agent: AgentAdapter },
  ): Promise<DispatchResult<T>>;
  sandbox(
    options?: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    >,
  ): Promise<Sandbox>;
  attach(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      AttachOptions & { readonly agent: AgentAdapter },
  ): Promise<AttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  integrate(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

export interface SandboxOptions extends WorkspaceOptions {
  readonly includeUncommitted?: boolean;
  readonly agent?: AgentAdapter;
  readonly provider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
  readonly recoveryTransport?: Transport;
  readonly activityTransport?: Transport;
}

export interface AttachOptions {
  readonly ask?: VariableQuestion;
  readonly agent?: AgentAdapter;
  readonly brief?: Brief;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
  readonly signal?: AbortSignal;
  readonly terminal?: Command["terminal"];
}

export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}

export interface DispatchResult<T> extends Execution<T> {
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly logReference?: TransportReference;
  readonly log?: string;
  readonly retainedDirectory?: string;
  resume<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
}

export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;

export interface WarmDispatchResult<T> extends Omit<
  DispatchResult<T>,
  "resume" | "fork"
> {
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
}

export interface Sandbox {
  diagnose(
    options?: SandboxDiagnosticOptions,
  ): Promise<SandboxDiagnosticReport>;
  readonly workspace: Workspace;
  readonly root: string;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<AttachResult>;
  command(command: Command): Promise<CommandResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
