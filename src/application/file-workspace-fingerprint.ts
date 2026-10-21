import {
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import type { FileWorkspace } from "./file-workspace.types.ts";

export async function workspaceFingerprint(
  workspace: FileWorkspace | string,
  paths?: readonly string[],
): Promise<string> {
  return workspaceManifestFingerprint(
    await workspaceManifest(
      typeof workspace === "string" ? workspace : workspace.directory,
      paths,
    ),
    paths,
  );
}
