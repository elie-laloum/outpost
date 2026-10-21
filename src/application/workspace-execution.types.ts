import type {
  Sandbox,
  SandboxOptions,
  Workspace,
  WorkspaceOptions,
} from "./outpost.types.ts";
import type {
  FileSandbox,
  FileSandboxOptions,
  FileDispatchRequest,
  FileDispatchResult,
} from "./file-sandbox.types.ts";

export type WorkspaceFactory = (
  options: WorkspaceOptions,
) => Promise<Workspace>;
export type SandboxFactory = (options: SandboxOptions) => Promise<Sandbox>;

export interface FileWorkspaceExecution {
  sandbox(options: FileSandboxOptions): Promise<FileSandbox>;
  dispatch<T>(options: FileDispatchRequest<T>): Promise<FileDispatchResult<T>>;
}
