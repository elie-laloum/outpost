import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { Command } from "../domain/command.types.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { Sandbox, SandboxOptions } from "./outpost.types.ts";
import type { QuotaResumePolicy } from "./quota-resume.types.ts";
import type {
  FileSandbox,
  FileSandboxOptions,
  FileDispatchRequest,
} from "./file-sandbox.types.ts";
import type { WorkspaceOutputOptions } from "../domain/file-workspace.types.ts";

export type CommandTaskOptions = {
  sandbox: Pick<Sandbox, "command">;
  command: Command | ((context: TaskContext) => Command);
};

export type IsolatedTaskOptions<T> = {
  request: (
    context: TaskContext,
  ) => IsolatedTaskRequest<T> | Promise<IsolatedTaskRequest<T>>;
  /** After a quota pause, continue the captured conversation or start a new one. */
  quotaResume?: QuotaResumePolicy;
};

export interface FileIsolatedTaskOptions<T> {
  readonly request: (
    context: TaskContext,
  ) => FileDispatchRequest<T> | Promise<FileDispatchRequest<T>>;
  readonly quotaResume?: QuotaResumePolicy;
}

export interface MixedIsolatedTaskOptions<T> {
  readonly request: (
    context: TaskContext,
  ) =>
    | IsolatedTaskRequest<T>
    | FileDispatchRequest<T>
    | Promise<IsolatedTaskRequest<T> | FileDispatchRequest<T>>;
  readonly quotaResume?: QuotaResumePolicy;
}

export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
  /** After a quota pause, continue the captured conversation or start a new one. */
  quotaResume?: QuotaResumePolicy;
};

export interface FileAgentTaskOptions<T> {
  readonly quotaResume?: QuotaResumePolicy;
  readonly sandbox: FileSandbox;
  readonly request: (context: TaskContext) => DispatchOptions<T>;
}

export interface MixedAgentTaskOptions<T> {
  readonly sandbox: Sandbox | FileSandbox;
  readonly request: (context: TaskContext) => DispatchOptions<T>;
  readonly quotaResume?: QuotaResumePolicy;
}

export interface IsolatedCommandTaskOptions {
  readonly request: (
    context: TaskContext,
  ) => FileIsolatedCommandRequest | Promise<FileIsolatedCommandRequest>;
}

export type FileIsolatedCommandRequest = FileSandboxOptions & {
  readonly command: Command;
  readonly outputs?: readonly WorkspaceOutputOptions[];
};

export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & { readonly agent: DispatchAgent };
