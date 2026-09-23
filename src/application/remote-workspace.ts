import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join, posix } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { WorkspaceRecord } from "../domain/workspace.types.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { gitDefaults } from "../infrastructure/git/git.constants.ts";
import { applyChanges } from "./remote-apply.ts";
import { backupHost } from "./remote-backup.ts";
import { downloadChanges } from "./remote-download.ts";
import { validateChanges } from "./remote-validation.ts";
import type {
  RemoteSync,
  RemoteSyncOptions,
  RemoteWorkspaceContext,
} from "./remote-workspace.types.ts";
import { digest, extras } from "./workspace-fingerprint.ts";

export type {
  RemoteSync,
  RemoteSyncOptions,
} from "./remote-workspace.types.ts";

export async function seedRemote(
  workspace: WorkspaceRecord,
  lease: SandboxLease,
  options: RemoteSyncOptions = {},
): Promise<RemoteSync> {
  options.signal?.throwIfAborted();
  const recovery = join(
    workspace.repository,
    ".outpost",
    "recovery",
    randomUUID(),
  );
  await mkdir(recovery, { recursive: true });
  const bundle = join(recovery, "initial.bundle");
  await git(workspace.directory, ["bundle", "create", bundle, "--all", "HEAD"]);
  const remoteBundle = posix.join(
    lease.root.replaceAll("\\", "/"),
    "..",
    `outpost-${randomUUID()}.bundle`,
  );
  await lease.upload(bundle, remoteBundle);
  let initializing = true,
    failed = false;
  const run = async (args: readonly string[]) => {
    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      result = await lease.invoke({
        executable: "git",
        arguments: args,
        directory: lease.root,
        retain: gitDefaults.retainBytes,
        ...(initializing && options.signal ? { signal: options.signal } : {}),
        ...(options.limits?.gitMs ? { deadlineMs: options.limits.gitMs } : {}),
      });
      if (!initializing || result.status !== 126) break;
    }
    if (!result)
      throw new OutpostError("workspace", "Remote Git did not start");
    if (result.status !== 0)
      throw new OutpostError("workspace", "Remote Git operation failed", {
        ...result,
        recovery,
      });
    return result.stdout;
  };
  await run(["init"]);
  await run(["config", "core.autocrlf", "false"]);
  await run(["fetch", remoteBundle, "HEAD"]);
  await run(["checkout", "-B", workspace.branch, "FETCH_HEAD"]);
  for (const key of ["user.name", "user.email"] as const) {
    const fallback = key === "user.name" ? "Outpost" : "outpost@localhost";
    const value =
      (
        await git(workspace.repository, ["config", "--get", key]).catch(
          () => fallback,
        )
      ).trim() || fallback;
    await run(["config", key, value]);
  }
  const initialPatch = join(recovery, "initial.patch");
  await git(workspace.directory, [
    "diff",
    "--binary",
    "HEAD",
    `--output=${initialPatch}`,
  ]);
  const initialIndex = join(recovery, "initial-index.patch");
  await git(workspace.directory, [
    "diff",
    "--cached",
    "--binary",
    `--output=${initialIndex}`,
  ]);
  const protectedFiles = options.includeUncommitted
    ? []
    : [
        ...(
          await git(workspace.directory, ["diff", "--name-only", "-z", "HEAD"])
        )
          .split("\0")
          .filter(Boolean),
        ...(await extras(workspace.directory)),
      ];
  const originalHead = (
    await git(workspace.directory, ["rev-parse", "HEAD"])
  ).trim();
  if (options.includeUncommitted && (await readFile(initialPatch)).length) {
    await lease.upload(initialPatch, `${remoteBundle}.patch`);
    await run(["apply", "--binary", `${remoteBundle}.patch`]);
  }
  for (const file of options.includeUncommitted
    ? await extras(workspace.directory)
    : [])
    await lease.upload(
      await safeDestination(workspace.directory, file),
      posix.join(lease.root, file),
    );
  let synchronized = (await run(["rev-parse", "HEAD"])).trim();
  initializing = false;
  let expected = await digest(workspace.directory, recovery);
  const context: RemoteWorkspaceContext = {
    workspace,
    lease,
    options,
    recovery,
    remoteBundle,
    run,
    protectedFiles,
    originalHead,
    initialPatch,
    initialIndex,
  };
  return {
    async close() {
      if (!failed) await rm(recovery, { recursive: true, force: true });
    },
    async pull() {
      const transfer = join(recovery, randomUUID());
      await mkdir(transfer, { recursive: true });
      try {
        const changes = await downloadChanges(context, synchronized, transfer);
        await validateChanges(
          context,
          changes,
          synchronized,
          expected,
          transfer,
        );
        const backup = await backupHost(
          context,
          changes,
          synchronized,
          transfer,
        );
        await applyChanges(
          context,
          changes,
          backup,
          synchronized,
          expected,
          transfer,
        );
        const { head } = changes;
        synchronized = head;
        expected = await digest(workspace.directory, recovery);
        await rm(transfer, { recursive: true, force: true });
      } catch (cause) {
        failed = true;
        throw new OutpostError(
          "workspace",
          "Remote changes could not be fully synchronized; recovery files retained",
          { recovery: transfer, directory: workspace.directory },
          cause,
        );
      }
    },
  };
}
