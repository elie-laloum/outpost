import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import type { FileWorkspace } from "./file-workspace.types.ts";

export interface TaskFileWorkspace {
  readonly workspace: FileWorkspace;
  settled(record: FileWorkspaceRecord): Promise<void>;
}
