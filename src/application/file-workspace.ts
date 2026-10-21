import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
import { openWorkspace } from "./workspace.ts";
import { workspaces } from "./workspace-registry.ts";
import { createFileWorkspace } from "./file-sandbox.ts";
import type { Workspace } from "./outpost.types.ts";
import type {
  GitWorkspaceOptions,
  GitWorkspace,
  FileWorkspaceOptions,
  FileWorkspace,
} from "./file-workspace.types.ts";
export { createFileWorkspace, restoreFileWorkspace } from "./file-sandbox.ts";
export {
  checkpointFileWorkspace,
  recordFileWorkspace,
  workspaceFingerprint,
} from "./file-workspace-lifecycle.ts";

export function createWorkspace(
  options: GitWorkspaceOptions,
): Promise<GitWorkspace>;
export function createWorkspace(
  options: FileWorkspaceOptions,
): Promise<FileWorkspace>;
export async function createWorkspace(
  options: GitWorkspaceOptions | FileWorkspaceOptions,
): Promise<Workspace | FileWorkspace> {
  if (!isFileWorkspaceOptions(options)) {
    const { source, ...settings } = options;
    const workspace = await openWorkspace({ ...settings, ...source });
    const runtimeDirectory = join(workspace.repository, ".outpost");
    const session: GitWorkspace = {
      ...workspace,
      kind: "git",
      id: randomUUID(),
      runtime: {
        directory: runtimeDirectory,
        namespace: createHash("sha256")
          .update(workspace.repository)
          .digest("hex")
          .slice(0, 24),
      },
      git: workspace,
    };
    const state = workspaces.get(workspace);
    invariant(state, "Git workspace ownership is unavailable");
    workspaces.set(session, state);
    return session;
  }
  return createFileWorkspace(options);
}

function isFileWorkspaceOptions(
  options: GitWorkspaceOptions | FileWorkspaceOptions,
): options is FileWorkspaceOptions {
  return options.source.kind !== "git";
}
