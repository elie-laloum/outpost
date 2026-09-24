import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { WorkspaceRecord } from "../domain/workspace.types.ts";
import { verificationGit } from "../infrastructure/git/verification-command.ts";
import type {
  RemoteSyncOptions,
  RemoteWorkspaceContext,
} from "./remote-workspace.types.ts";

async function probe(
  operation: () => Promise<string>,
): Promise<string | undefined> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof OutpostError &&
      (error.details.status === 1 || error.details.status === 128)
    )
      return undefined;
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === 1 || error.code === 128)
    )
      return undefined;
    throw error;
  }
}

export async function seedHistory(
  workspace: WorkspaceRecord,
  lease: SandboxLease,
  options: RemoteSyncOptions,
  recovery: string,
  remoteBundle: string,
  run: RemoteWorkspaceContext["run"],
): Promise<void> {
  const local = (args: readonly string[]) =>
    verificationGit(
      workspace.directory,
      args,
      options.limits?.gitMs,
      options.signal,
    );
  const bundle = join(recovery, "initial.bundle");
  await local(["bundle", "create", bundle, "--all", "HEAD"]);
  const head = (await local(["rev-parse", "HEAD"])).trim();
  const candidate = (
    await probe(() => run(["rev-parse", "--verify", "HEAD"]))
  )?.trim();
  let base: string | undefined;
  if (
    candidate &&
    /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(candidate) &&
    (await probe(() =>
      local(["merge-base", "--is-ancestor", candidate, head]),
    )) !== undefined &&
    (await probe(() =>
      run(["rev-list", "--objects", "--missing=error", "--quiet", candidate]),
    )) !== undefined
  )
    base = candidate;
  if (base === head) {
    await run(["checkout", "-B", workspace.branch, head]);
    return;
  }
  let payload = bundle;
  if (base) {
    payload = join(recovery, "initial-delta.bundle");
    await local(["bundle", "create", payload, "--all", "HEAD", `^${base}`]);
  }
  await lease.upload(payload, remoteBundle, {
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.limits?.copyMs ? { deadlineMs: options.limits.copyMs } : {}),
  });
  if (
    base &&
    (await probe(() => run(["bundle", "verify", remoteBundle]))) === undefined
  )
    await lease.upload(bundle, remoteBundle, {
      ...(options.signal ? { signal: options.signal } : {}),
      ...(options.limits?.copyMs ? { deadlineMs: options.limits.copyMs } : {}),
    });
  await run(["bundle", "verify", remoteBundle]);
  await run(["fetch", remoteBundle, "HEAD"]);
  await run(["checkout", "-B", workspace.branch, "FETCH_HEAD"]);
}

export async function prepareHistoryValidation(
  context: RemoteWorkspaceContext,
  transfer: string,
): Promise<string> {
  const validation = join(transfer, "validation");
  await mkdir(validation, { recursive: true });
  const snapshot = join(transfer, "host.bundle");
  const run = (directory: string, args: readonly string[]) =>
    verificationGit(directory, args, context.options.limits?.gitMs);
  await run(context.workspace.directory, [
    "bundle",
    "create",
    snapshot,
    "HEAD",
  ]);
  const format = (
    await run(context.workspace.directory, [
      "rev-parse",
      "--show-object-format",
    ])
  ).trim();
  await run(validation, ["init", `--object-format=${format}`]);
  await run(validation, ["config", "core.autocrlf", "false"]);
  await run(validation, ["fetch", snapshot, "HEAD"]);
  await run(validation, ["update-ref", "HEAD", "FETCH_HEAD"]);
  await rm(snapshot);
  return validation;
}

export async function downloadHistory(
  context: RemoteWorkspaceContext,
  synchronized: string,
  head: string,
  transfer: string,
): Promise<void> {
  const { run, lease, remoteBundle, options } = context;
  const validation = await prepareHistoryValidation(context, transfer);
  const local = (args: readonly string[]) =>
    verificationGit(validation, args, options.limits?.gitMs);
  const usable =
    (await probe(() =>
      local([
        "rev-list",
        "--objects",
        "--missing=error",
        "--quiet",
        synchronized,
      ]),
    )) !== undefined &&
    (await probe(() =>
      run(["merge-base", "--is-ancestor", synchronized, head]),
    )) !== undefined;
  await run([
    "bundle",
    "create",
    remoteBundle,
    "HEAD",
    ...(usable ? [`^${synchronized}`] : []),
  ]);
  const bundle = join(transfer, "commits.bundle");
  const received = usable ? join(transfer, "commits-delta.bundle") : bundle;
  await lease.download(remoteBundle, received, {
    ...(options.limits?.copyMs ? { deadlineMs: options.limits.copyMs } : {}),
  });
  await local(["bundle", "verify", received]);
  await local(["fetch", received, "HEAD"]);
  if ((await local(["rev-parse", "FETCH_HEAD"])).trim() !== head)
    throw new OutpostError(
      "workspace",
      "Remote bundle HEAD changed during synchronization",
    );
  await local(["rev-list", "--objects", "--missing=error", "--quiet", head]);
  await local(["update-ref", "HEAD", head]);
  const complete = join(transfer, "complete.bundle");
  await local(["bundle", "create", complete, "HEAD"]);
  await rename(complete, bundle);
  if (usable) await rm(received);
}
