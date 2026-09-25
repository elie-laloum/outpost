import { lstat } from "node:fs/promises";
import { join, posix } from "node:path";
import type { Agent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { git } from "../infrastructure/git/command.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import { registerResourceActivity } from "../infrastructure/resource-activity.ts";
import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";
import { trackedSandboxLease } from "./sandbox-activity.ts";
import { boundedTransfers } from "../infrastructure/transfer.ts";
import { dockerSandboxProvider } from "../providers/docker.ts";
import { prepareAdapter } from "./agent-bootstrap.ts";
import { hooks } from "./lifecycle-hooks.ts";
import type { SandboxOptions } from "./outpost.types.ts";
import { uploadFiles } from "./remote-upload.ts";
import { seedRemote } from "./remote-workspace.ts";
import type { RemoteSync } from "./remote-workspace.types.ts";
import type { ProvisionedSandbox } from "./sandbox-session.types.ts";
import { startupFailure } from "./startup-recovery.ts";
import { workspaces } from "./workspace-registry.ts";
import { openWorkspace } from "./workspace.ts";

export async function provisionSandbox(
  options: SandboxOptions,
): Promise<ProvisionedSandbox> {
  invariant(
    !("provider" in options),
    "Use sandboxProvider instead of provider",
  );
  options.signal?.throwIfAborted();
  const sandboxProvider = options.sandboxProvider ?? dockerSandboxProvider();
  if (
    sandboxProvider.placement === "remote" &&
    !options.workspace &&
    !options.branch
  )
    options = { ...options, branch: { mode: "integrate" } };
  invariant(
    !options.workspace ||
      (!options.repository &&
        !options.branch &&
        !options.copies &&
        !options.storageQuota),
    "A supplied workspace owns its repository, branch, copied inputs and storage quota",
  );
  const owned = !options.workspace;
  invariant(
    sandboxProvider.placement !== "remote" ||
      ((options.workspace?.policy ?? options.branch)?.mode !== "current" &&
        (options.workspace || options.branch)),
    "Remote providers require a named or integration workspace",
  );
  const workspace = options.workspace ?? (await openWorkspace(options));
  const state = workspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Workspace must be open and cannot belong to another sandbox",
  );
  state.active = true;
  const lifecycle = options.hooks ?? state.hooks;
  const stop = new AbortController();
  const setupSignal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  let lease: SandboxLease | undefined, sync: RemoteSync | undefined;
  let activity: ResourceActivity | undefined;
  let acquisitionStarted = false;
  const prepared = new Map<Agent, Agent>();
  const staging = join(
    workspace.repository,
    ".outpost",
    "recovery",
    "conversations",
  );
  try {
    activity = await registerResourceActivity({
      repository: workspace.repository,
      ...(options.activityTransport
        ? { transporter: options.activityTransport }
        : {}),
      workspace: workspace.directory,
      sandboxProvider: sandboxProvider.name,
      placement: sandboxProvider.placement,
    });
    const configured = await resolveVariables(
      workspace.repository,
      {},
      sandboxProvider.variables,
    );
    const name = (
      await git(workspace.repository, ["config", "--get", "user.name"]).catch(
        () => "Outpost",
      )
    ).trim();
    const email = (
      await git(workspace.repository, ["config", "--get", "user.email"]).catch(
        () => "outpost@localhost",
      )
    ).trim();
    const variables = {
      GIT_AUTHOR_NAME: name,
      GIT_COMMITTER_NAME: name,
      GIT_AUTHOR_EMAIL: email,
      GIT_COMMITTER_EMAIL: email,
      ...configured,
    };
    acquisitionStarted = true;
    lease = boundedTransfers(
      trackedSandboxLease(
        await sandboxProvider.acquire({
          repository: workspace.repository,
          directory: workspace.directory,
          gitDirectories: workspace.gitDirectories,
          variables,
          signal: setupSignal,
        }),
        activity,
      ),
      {
        ...(options.limits?.copyMs
          ? { deadlineMs: options.limits.copyMs }
          : {}),
      },
    );
    if (sandboxProvider.placement === "remote") {
      sync = await seedRemote(workspace, lease, {
        ...(options.recoveryTransport
          ? { recoveryTransport: options.recoveryTransport }
          : {}),
        ...(options.includeUncommitted ? { includeUncommitted: true } : {}),
        ...(options.limits ? { limits: options.limits } : {}),
        signal: setupSignal,
      });
      const copiedFiles: string[] = [];
      for (const path of options.copies ?? []) {
        const info = await lstat(join(workspace.directory, path)).catch(
          (error) => {
            if ((error as NodeJS.ErrnoException).code === "ENOENT")
              return undefined;
            throw error;
          },
        );
        if (!info) continue;
        if (info.isFile() || info.isSymbolicLink()) {
          copiedFiles.push(path.replaceAll("\\", "/"));
          continue;
        }
        await lease.upload(
          join(workspace.directory, path),
          posix.join(lease.root, path.replaceAll("\\", "/")),
          { signal: setupSignal },
        );
      }
      await uploadFiles(lease, workspace.directory, [...new Set(copiedFiles)], {
        signal: setupSignal,
      });
      if (options.bootstrap !== false && options.agent)
        prepared.set(
          options.agent,
          await prepareAdapter(options.agent, lease, setupSignal),
        );
    }
    const initialized = await Promise.allSettled(
      [
        hooks(
          lifecycle?.hostReady ?? [],
          workspace.directory,
          executeProcess,
          setupSignal,
        ),
        hooks(
          lifecycle?.sandboxReady ?? [],
          lease.root,
          lease.invoke.bind(lease),
          setupSignal,
          true,
        ),
      ].map((pending) =>
        pending.catch((cause) => {
          stop.abort(cause);
          throw cause;
        }),
      ),
    );
    const failure = initialized.find((item) => item.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
    await activity.phase("ready");
  } catch (cause) {
    await startupFailure(workspace, cause, options);
    const allocationUncertain = acquisitionStarted && !lease;
    let cleanupFailed = allocationUncertain;
    await activity?.phase("closing").catch(() => {
      cleanupFailed = true;
    });
    await lease?.release().catch(() => {
      cleanupFailed = true;
    });
    if (activity && !(await activity.idle())) cleanupFailed = true;
    state.active = false;
    if (owned)
      await workspace.close({ preserve: cleanupFailed }).catch(() => {
        cleanupFailed = true;
      });
    if (cleanupFailed)
      await activity
        ?.phase(allocationUncertain ? "allocation-uncertain" : "cleanup-failed")
        .catch(() => undefined);
    if (!cleanupFailed) await activity?.remove().catch(() => undefined);
    throw cause;
  }

  return {
    options,
    sandboxProvider,
    workspace,
    state,
    owned,
    stop,
    runtime: lease,
    activity,
    sync,
    prepared,
    staging,
  };
}
