import { randomUUID } from "node:crypto";
import {
  invariant,
  OutpostError,
  positive,
  recordRecovery,
} from "../domain/errors.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import type { WorkspaceLease } from "../infrastructure/git/workspace.types.ts";
import { conflictResolutionDefaults } from "./conflict-resolution.constants.ts";
import type {
  IntegrationOptions,
  ConflictResolution,
} from "./conflict-resolution.types.ts";
import type { Workspace, WorkspaceOptions } from "./outpost.types.ts";
import { checkSpeculationIntegration } from "./speculation-integration.ts";
import { openWorkspace } from "./workspace.ts";
import { workspaces } from "./workspace-registry.ts";

export async function integrateWorkspace(
  workspace: Workspace,
  lease: WorkspaceLease,
  options: WorkspaceOptions,
  settings: IntegrationOptions = {},
): Promise<ConflictResolution | void> {
  settings.signal?.throwIfAborted();
  const onConflict = settings.onConflict;
  if (!onConflict) return lease.integrate();
  invariant(
    workspace.policy.mode === "integrate",
    "Conflict resolution requires an integration workspace",
  );
  const state = workspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Close the sandbox before resolving integration conflicts",
  );
  const signal = AbortSignal.any([
    AbortSignal.timeout(
      positive(
        settings.deadlineMs ?? conflictResolutionDefaults.deadlineMs,
        "Integration deadlineMs",
      ),
    ),
    ...(settings.signal ? [settings.signal] : []),
  ]);
  state.active = true;
  let resolution: Workspace | undefined;
  let successful = false;
  try {
    await lease.checkGuard();
    const preflight = await observedOperation(
      options.observation,
      "git",
      "integration.preflight",
      () => checkSpeculationIntegration(workspace.repository, workspace.branch),
    );
    signal.throwIfAborted();
    if (
      preflight.host.branch !== workspace.baseBranch ||
      preflight.status === "blocked"
    )
      throw new OutpostError(
        "conflict",
        preflight.reason ?? "Host branch changed before integration",
      );
    invariant(
      preflight.candidateCommit,
      "Integration preflight did not produce a candidate commit",
    );
    if (preflight.status === "clean") {
      await lease.integrate({
        mode: "merge",
        record: workspace,
        hostCommit: preflight.host.head,
        sourceCommit: preflight.candidateCommit,
        commit: preflight.candidateCommit,
        signal,
      });
      return;
    }
    const candidateCommit = preflight.candidateCommit;
    const resolutionWorkspace = await openWorkspace({
      repository: workspace.repository,
      branch: {
        mode: "named",
        name: `outpost/resolve-${randomUUID()}`,
        from: preflight.candidateCommit,
      },
      ...(options.observation ? { observation: options.observation } : {}),
      ...(options.limits ? { limits: options.limits } : {}),
      signal,
    });
    resolution = resolutionWorkspace;
    const result = await observedOperation(
      options.observation,
      "git",
      "integration.resolve",
      () =>
        onConflict({
          workspace: resolutionWorkspace,
          hostCommit: preflight.host.head,
          candidateCommit,
          conflicts: preflight.conflicts,
          signal,
          ...(options.observation ? { observation: options.observation } : {}),
        }),
    );
    invariant(
      result.branch === resolution.branch &&
        result.directory === resolution.directory,
      "Resolver must return its supplied workspace",
    );
    if (result.verification.status !== 0)
      throw new OutpostError(
        "process",
        "Conflict resolution verification failed",
        { verification: result.verification },
      );
    await lease.integrate({
      mode: "resolved",
      record: resolution,
      hostCommit: preflight.host.head,
      sourceCommit: preflight.candidateCommit,
      commit: result.commit,
      signal,
    });
    successful = true;
    return result;
  } catch (cause) {
    lease.retain();
    if (resolution)
      recordRecovery(cause, {
        branch: resolution.branch,
        directory: resolution.directory,
        sourceBranch: workspace.branch,
        sourceDirectory: workspace.directory,
      });
    throw cause;
  } finally {
    state.active = false;
    await resolution?.close({ preserve: !successful });
  }
}
