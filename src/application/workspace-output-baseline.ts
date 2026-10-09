import { lstat } from "node:fs/promises";
import { invariant } from "../domain/errors.ts";
import type {
  WorkspaceOutputBaseline,
  WorkspaceOutputOptions,
} from "../domain/file-workspace.types.ts";
import {
  canonicalWorkspacePath,
  lockWorkspacePath,
} from "../infrastructure/workspace-lock.ts";
import {
  workspaceManifest,
  validateWorkspaceSelection,
} from "../infrastructure/workspace-files.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type { FileWorkspace } from "./file-workspace.types.ts";

export function workspaceOutputIdentity(
  options: WorkspaceOutputOptions,
): string {
  return JSON.stringify({
    destination: options.destination,
    paths: options.paths,
    policy: options.policy,
    deleteMissing: options.deleteMissing ?? false,
  });
}

export async function captureWorkspaceOutputBaseline(
  options: WorkspaceOutputOptions,
): Promise<WorkspaceOutputBaseline> {
  validateWorkspaceSelection(options.paths);
  invariant(
    options.policy === "create" || options.policy === "update",
    "Unsupported workspace publication policy",
  );
  const destination = await canonicalWorkspacePath(options.destination);
  const release = await lockWorkspacePath(destination, false);
  try {
    const info = await lstat(destination).catch((error) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return undefined;
      throw error;
    });
    invariant(
      options.policy !== "create" || !info,
      "Publication create destination already exists",
    );
    invariant(
      !info || info.isDirectory(),
      "Publication destination must be a directory",
    );
    return {
      options: { ...options, destination },
      expected: info ? await workspaceManifest(destination, options.paths) : [],
    };
  } finally {
    await release();
  }
}

export async function prepareWorkspaceOutputs(
  workspace: FileWorkspace,
  outputs: readonly WorkspaceOutputOptions[],
): Promise<void> {
  const state = fileWorkspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Publication preparation requires a settled workspace",
  );
  for (const options of outputs) {
    const captured = await captureWorkspaceOutputBaseline(options);
    state.publications.set(workspaceOutputIdentity(captured.options), captured);
  }
}
