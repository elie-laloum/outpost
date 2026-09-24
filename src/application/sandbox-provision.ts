import { lstat } from "node:fs/promises";
import { join, posix } from "node:path";
import type { AgentAdapter } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { git } from "../infrastructure/git/command.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import { boundedTransfers } from "../infrastructure/transfer.ts";
import { docker } from "../providers/docker.ts";
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
  options.signal?.throwIfAborted();
  const provider = options.provider ?? docker();
  if (provider.placement === "remote" && !options.workspace && !options.branch)
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
    provider.placement !== "remote" ||
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
  const prepared = new Map<AgentAdapter, AgentAdapter>();
  const staging = join(
    workspace.repository,
    ".outpost",
    "recovery",
    "conversations",
  );
  try {
    const configured = await resolveVariables(
      workspace.repository,
      {},
      provider.variables,
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
    lease = boundedTransfers(
      await provider.acquire({
        repository: workspace.repository,
        directory: workspace.directory,
        gitDirectories: workspace.gitDirectories,
        variables,
        signal: setupSignal,
      }),
      {
        ...(options.limits?.copyMs
          ? { deadlineMs: options.limits.copyMs }
          : {}),
      },
    );
    if (provider.placement === "remote") {
      sync = await seedRemote(workspace, lease, {
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
  } catch (cause) {
    await startupFailure(workspace, cause, options);
    await lease?.release().catch(() => undefined);
    state.active = false;
    if (owned) await workspace.close();
    throw cause;
  }

  return {
    options,
    provider,
    workspace,
    state,
    owned,
    stop,
    runtime: lease,
    sync,
    prepared,
    staging,
  };
}
