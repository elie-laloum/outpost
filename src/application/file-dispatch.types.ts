import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import type { FileSandbox, FileSandboxOptions } from "./file-sandbox.types.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
  FileWorkspaceRegistration,
  RestoreFileWorkspaceOptions,
} from "./file-workspace.types.ts";

export interface FileDispatchRuntime {
  createWorkspace(options: FileWorkspaceOptions): Promise<FileWorkspace>;
  restoreWorkspace(
    record: FileWorkspaceRecord,
    options: RestoreFileWorkspaceOptions,
  ): Promise<FileWorkspace>;
  createSandbox(
    options: FileSandboxOptions,
    onSettled?: FileWorkspaceRegistration,
  ): Promise<FileSandbox>;
}
