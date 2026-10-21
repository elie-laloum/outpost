import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { invariant, recordRecovery } from "../domain/errors.ts";
import type { WorkspaceAllocationRecord } from "../domain/file-workspace.types.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { TransportReference } from "../domain/transport.types.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { registerResourceActivity } from "../infrastructure/resource-activity.ts";
import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";
import { boundedTransfers } from "../infrastructure/transfer.ts";
import { jsonBytes } from "../infrastructure/transport-json.ts";
import { workspaceManifest } from "../infrastructure/workspace-files.ts";
import type {
  FileSandboxProvision,
  ProvisionedFileSandbox,
} from "./file-sandbox-context.types.ts";
import {
  checkpointFileWorkspace,
  recordFileWorkspace,
} from "./file-workspace-lifecycle.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import { createLifecycleHookRunner } from "./lifecycle-hooks.ts";
import { observedLease } from "./observed-lease.ts";
import { trackedSandboxLease } from "./sandbox-activity.ts";

/** Acquires the sandbox of a file workspace and journals its allocation for recovery. */
export async function provisionFileSandbox({
  options,
  workspace,
  owned,
  onSettled,
}: FileSandboxProvision): Promise<ProvisionedFileSandbox> {
  const capability = options.sandboxProvider.workspaces!;
  const state = fileWorkspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Workspace is closed or already acquired",
  );
  state.active = true;
  const lifecycle = options.hooks ?? state.options.hooks;
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  const staging = join(workspace.runtime.directory, "staging", workspace.id);
  let runtime: SandboxLease | undefined;
  let activity: ResourceActivity | undefined;
  const recoveryTransport =
    options.recoveryTransport ??
    (state.options.retention?.policy === "portable"
      ? state.options.retention.transporter
      : createLocalTransport({
          directory: join(workspace.runtime.directory, "storage"),
        }));
  const allocationKey = `allocations/${workspace.runtime.namespace}/${workspace.id}/${randomUUID()}`;
  let allocationReference: TransportReference | undefined;
  let resourceId: string | undefined;
  let acquisitionStarted = false;
  const hostHooks = createLifecycleHookRunner(
    lifecycle?.hostReady ?? [],
    workspace.directory,
    executeProcess,
  );
  let sandboxHooks: ProvisionedFileSandbox["sandboxHooks"] | undefined;
  const allocation = async (phase: WorkspaceAllocationRecord["state"]) => {
    const reference = await recoveryTransport.write(
      allocationKey,
      jsonBytes({
        format: 1,
        workspaceId: workspace.id,
        provider: options.sandboxProvider.name,
        state: phase,
        ...(resourceId ? { resourceId } : {}),
      }),
      { ifRevision: allocationReference?.revision ?? null },
    );
    allocationReference = { key: reference.key, revision: reference.revision };
    state.record = {
      ...state.record,
      allocation: {
        provider: options.sandboxProvider.name,
        state: phase,
        ...(resourceId ? { resourceId } : {}),
        reference: allocationReference,
      },
    };
    await recordFileWorkspace(workspace);
    await onSettled?.(state.record);
  };
  try {
    await hostHooks(signal, false, options.observation);
    const prepared = await checkpointFileWorkspace(workspace, true);
    await onSettled?.(prepared);
    await mkdir(staging, { recursive: true, mode: 0o700 });
    activity = await registerResourceActivity({
      repository: workspace.runtime.directory,
      transporter:
        options.activityTransport ??
        createLocalTransport({
          directory: join(workspace.runtime.directory, "storage"),
        }),
      workspace: workspace.directory,
      sandboxProvider: options.sandboxProvider.name,
      placement: options.sandboxProvider.placement,
    });
    await allocation("allocating");
    acquisitionStarted = true;
    runtime = await observedOperation(
      options.observation,
      "sandbox",
      "sandbox.acquire",
      () =>
        capability.acquire({
          workspace: state.record,
          runtime: workspace.runtime,
          variables: {
            ...options.sandboxProvider.variables,
            ...options.variables,
          },
          signal,
          async registerRecovery(id) {
            resourceId = id;
            await allocation("allocating");
          },
        }),
    );
    await allocation("active");
    runtime = observedLease(
      boundedTransfers(trackedSandboxLease(runtime, activity), {
        ...(options.limits?.copyMs
          ? { deadlineMs: options.limits.copyMs }
          : {}),
      }),
      options.observation,
    );
    if (options.sandboxProvider.placement === "remote")
      await runtime.upload(`${workspace.directory}/.`, runtime.root, {
        signal,
      });
    sandboxHooks = createLifecycleHookRunner(
      lifecycle?.sandboxReady ?? [],
      runtime.root,
      runtime.invoke.bind(runtime),
      true,
    );
    await sandboxHooks(signal, false, options.observation);
    await activity.phase("ready");
  } catch (error) {
    if (runtime && options.sandboxProvider.placement === "remote") {
      const incoming = join(staging, `startup-${randomUUID()}`);
      try {
        await runtime.download(`${runtime.root}/.`, incoming);
        await workspaceManifest(incoming);
        recordRecovery(error, { incomingDirectory: incoming });
      } catch (collection) {
        recordRecovery(error, {
          incomingDirectory: incoming,
          collectionError: collection,
        });
      }
    }
    let released = !acquisitionStarted;
    try {
      await runtime?.release();
      released ||= !!runtime;
      await allocation(released ? "released" : "uncertain");
    } catch (cleanup) {
      recordRecovery(error, {
        allocationReference,
        resourceId,
        cleanupError: cleanup,
      });
    }
    state.active = !released;
    try {
      if (released) await activity?.remove();
      if (!released) await activity?.phase("allocation-uncertain");
      if (owned && released) await workspace.close({ preserve: true });
    } catch (cleanup) {
      recordRecovery(error, { cleanupError: cleanup });
    }
    recordRecovery(error, {
      workspaceInfo: state.record,
      allocationReference,
      resourceId,
      directory: workspace.directory,
    });
    throw error;
  }
  const lease = runtime;
  const ready = activity;
  return {
    options,
    workspace,
    state,
    lease,
    staging,
    signal,
    hostHooks,
    sandboxHooks,
    abort(reason) {
      stop.abort(reason);
    },
    async release(settings) {
      await ready.phase("closing");
      try {
        await lease.release();
      } catch (error) {
        recordRecovery(error, {
          workspaceId: workspace.id,
          directory: workspace.directory,
          allocation: "uncertain",
        });
        throw error;
      }
      await allocation("released");
      await ready.remove();
      state.active = false;
      return owned ? workspace.close(settings) : {};
    },
  };
}
