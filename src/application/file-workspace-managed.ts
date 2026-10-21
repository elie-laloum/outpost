import { lstat, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { invariant } from "../domain/errors.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { makeWorkspaceDirectoriesWritable } from "../infrastructure/workspace-cleanup.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
  FileWorkspaceState,
} from "./file-workspace.types.ts";
import type { FileWorkspaceExecution } from "./workspace-execution.types.ts";
import { workspaceOutputIdentity } from "./workspace-output-baseline.ts";

import {
  checkpointFileWorkspace,
  recordFileWorkspace,
} from "./file-workspace-checkpoint.ts";
import { workspaceOwner } from "./file-workspace-owner.ts";
export function managedFileWorkspace(
  record: FileWorkspaceRecord,
  options: FileWorkspaceOptions,
  execution: FileWorkspaceExecution,
  releaseSource: () => Promise<void>,
  suspendSourceForPublication?: () => Promise<() => Promise<void>>,
  recordRevision?: string,
): FileWorkspace {
  const { id, source, runtime, directory: root } = record;
  const owned = dirname(root);
  const marker = join(owned, "owner.json");
  const state: FileWorkspaceState = {
    options,
    marker,
    inputs: record.inputs ?? [],
    releaseSource,
    ...(suspendSourceForPublication ? { suspendSourceForPublication } : {}),
    publications: new Map(
      (record.publicationBaselines ?? []).map((baseline) => [
        workspaceOutputIdentity(baseline.options),
        baseline,
      ]),
    ),
    active: false,
    closed: false,
    generation: record.generation,
    record,
    recordTransport:
      options.retention?.policy === "portable"
        ? options.retention.transporter
        : createLocalTransport({
            directory: join(runtime.directory, "storage"),
          }),
    ...(recordRevision ? { recordRevision } : {}),
  };
  const workspace: FileWorkspace = {
    id,
    kind: source.kind,
    source,
    directory: root,
    runtime,
    sandbox(settings) {
      return execution.sandbox({ ...settings, workspace });
    },
    dispatch(settings) {
      return execution.dispatch({ ...settings, workspace });
    },
    checkpoint() {
      return checkpointFileWorkspace(workspace);
    },
    async close(settings = {}) {
      invariant(
        !state.active,
        "Close the sandbox before closing its workspace",
      );
      if (state.closed) return state.disposal ?? {};
      const preserve =
        settings.preserve ||
        options.retention?.policy === "local" ||
        options.retention?.policy === "portable";
      const currentRoot = await lstat(root);
      invariant(
        currentRoot.isDirectory() &&
          currentRoot.dev === state.record.materialization.device &&
          currentRoot.ino === state.record.materialization.inode,
        "Workspace materialization was replaced; cleanup requires explicit recovery",
      );
      state.record = {
        ...state.record,
        owner: { ...state.record.owner, state: "released" },
      };
      await recordFileWorkspace(workspace);
      if (!preserve) {
        invariant(
          (await workspaceOwner(marker)).id === id,
          "Workspace ownership changed",
        );
        await makeWorkspaceDirectoriesWritable(owned);
        await rm(owned, { recursive: true });
      }
      await releaseSource();
      state.closed = true;
      state.disposal = preserve ? { retainedDirectory: root } : {};
      return state.disposal;
    },
    async [Symbol.asyncDispose]() {
      await workspace.close();
    },
  };
  fileWorkspaces.set(workspace, state);
  return workspace;
}
