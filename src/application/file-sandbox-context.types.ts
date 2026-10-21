import type { Disposal } from "../domain/workspace.types.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { AgentSessions } from "./agent-sessions.types.ts";
import type { DispatchExecutionContext } from "./dispatch-context.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type {
  FileDispatchResult,
  FileSandbox,
  FileSandboxOptions,
} from "./file-sandbox.types.ts";
import type {
  FileWorkspace,
  FileWorkspaceRegistration,
  FileWorkspaceState,
} from "./file-workspace.types.ts";
import type { createLifecycleHookRunner } from "./lifecycle-hooks.ts";
import type { operationGate } from "./operation-gate.ts";

export interface FileSandboxSynchronizationContext {
  readonly options: FileSandboxOptions;
  readonly workspace: FileWorkspace;
  readonly state: FileWorkspaceState;
  readonly lease: SandboxLease;
  readonly staging: string;
}

export interface FileSandboxProvision {
  readonly options: FileSandboxOptions;
  readonly workspace: FileWorkspace;
  /** Whether closing the sandbox also closes the workspace it created. */
  readonly owned: boolean;
  readonly onSettled?: FileWorkspaceRegistration;
}

export interface ProvisionedFileSandbox extends FileSandboxSynchronizationContext {
  readonly signal: AbortSignal;
  readonly hostHooks: ReturnType<typeof createLifecycleHookRunner>;
  readonly sandboxHooks: ReturnType<typeof createLifecycleHookRunner>;
  abort(reason: unknown): void;
  /** Releases the lease, journals the release and closes an owned workspace. */
  release(settings: { readonly preserve?: boolean }): Promise<Disposal>;
}

export interface FileSettlement {
  failed(): boolean;
  synchronize(): Promise<void>;
  checkpoint(): Promise<FileWorkspaceRecord>;
  settled<T>(action: () => Promise<T>, signal?: AbortSignal): Promise<T>;
}

export interface FileSandboxAttachmentContext extends FileSandboxSynchronizationContext {
  readonly signal: AbortSignal;
  readonly gate: ReturnType<typeof operationGate>;
  readonly agents: AgentSessions;
  readonly settlement: FileSettlement;
}

export interface FileSandboxDispatchContext extends FileSandboxAttachmentContext {
  /** The facade whose `resume` and `fork` continue a dispatch result. */
  sandbox(): Pick<FileSandbox, "resume" | "fork">;
}

export type FileSandboxDispatch = <T = undefined>(
  options: DispatchOptions<T>,
  executionContext?: DispatchExecutionContext,
) => Promise<FileDispatchResult<T>>;
