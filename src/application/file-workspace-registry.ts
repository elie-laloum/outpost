import type {
  FileWorkspace,
  FileWorkspaceState,
} from "./file-workspace.types.ts";

export const fileWorkspaces = new WeakMap<FileWorkspace, FileWorkspaceState>();
