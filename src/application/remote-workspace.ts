import {
  cp,
  lstat,
  mkdir,
  readFile,
  readlink,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { OutpostError } from "../domain/errors.ts";
import type {
  SandboxLease,
  StageLimits,
  WorkspaceRecord,
} from "../domain/ports.ts";
import { git } from "../infrastructure/git.ts";
import { safeDestination } from "../infrastructure/files.ts";

export interface RemoteSync {
  pull(): Promise<void>;
  close(): Promise<void>;
}

export interface RemoteSyncOptions {
  readonly includeUncommitted?: boolean;
  readonly signal?: AbortSignal;
  readonly limits?: StageLimits;
}

async function extras(directory: string): Promise<string[]> {
  return (
    await git(directory, ["ls-files", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter((file) => file && !file.startsWith(".outpost/"));
}

async function digest(directory: string, recovery: string): Promise<string> {
  const hash = createHash("sha256");
  hash.update(await git(directory, ["rev-parse", "HEAD"]));
  const patch = join(recovery, "fingerprint.patch");
  await git(directory, ["diff", "--binary", "HEAD", `--output=${patch}`]);
  hash.update(await readFile(patch));
  hash.update(await git(directory, ["diff", "--cached", "--binary"]));
  for (const file of await extras(directory)) {
    const path = await safeDestination(directory, file),
      info = await lstat(path);
    hash.update(file).update(String(info.mode));
    hash.update(
      info.isSymbolicLink() ? await readlink(path) : await readFile(path),
    );
  }
  return hash.digest("hex");
}

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
        retain: 16_777_216,
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
  return {
    async close() {
      if (!failed) await rm(recovery, { recursive: true, force: true });
    },
    async pull() {
      const transfer = join(recovery, randomUUID());
      await mkdir(transfer, { recursive: true });
      try {
        const head = (await run(["rev-parse", "HEAD"])).trim(),
          patch = join(transfer, "remote.patch");
        await run([
          "diff",
          "--binary",
          "HEAD",
          `--output=${remoteBundle}.patch`,
        ]);
        await lease.download(`${remoteBundle}.patch`, patch);
        const incoming = (
          await run(["ls-files", "--others", "--exclude-standard", "-z"])
        )
          .split("\0")
          .filter(Boolean);
        for (const file of incoming) {
          if (/^\.outpost\/(locks|recovery|workspaces|logs)(\/|$)/i.test(file))
            throw new OutpostError(
              "workspace",
              "Remote file overlaps Outpost runtime state",
              { file },
            );
          await safeDestination(workspace.directory, file);
          await lease.download(
            posix.join(lease.root, file),
            await safeDestination(join(transfer, "incoming"), file),
          );
        }
        if (head !== synchronized) {
          await run(["bundle", "create", remoteBundle, "HEAD"]);
          await lease.download(remoteBundle, join(transfer, "commits.bundle"));
        }
        if (protectedFiles.length) {
          const changed = new Set([
            ...(await run(["diff", "--name-only", "-z", originalHead]))
              .split("\0")
              .filter(Boolean),
            ...incoming,
          ]);
          const overlaps = protectedFiles.filter((file) =>
            [...changed].some(
              (path) =>
                path === file ||
                path.startsWith(`${file}/`) ||
                file.startsWith(`${path}/`),
            ),
          );
          if (overlaps.length)
            throw new OutpostError(
              "conflict",
              "Remote changes overlap uncommitted host files",
              { files: overlaps, recovery: transfer },
            );
        }
        if ((await digest(workspace.directory, recovery)) !== expected)
          throw new OutpostError(
            "conflict",
            "Host workspace changed while the remote sandbox was active",
            { recovery },
          );
        if (head !== synchronized) {
          await git(workspace.directory, [
            "fetch",
            join(transfer, "commits.bundle"),
            "HEAD",
          ]);
          await git(workspace.directory, [
            "merge-base",
            "--is-ancestor",
            "HEAD",
            "FETCH_HEAD",
          ]);
        }
        const validation = join(transfer, "validation");
        await git(workspace.directory, [
          "worktree",
          "add",
          "--detach",
          validation,
          head,
        ]);
        try {
          if ((await readFile(patch)).length)
            await git(validation, ["apply", "--binary", patch]);
          if (
            !options.includeUncommitted &&
            (await readFile(initialPatch)).length
          )
            await git(validation, ["apply", "--binary", initialPatch]);
          if (
            !options.includeUncommitted &&
            (await readFile(initialIndex)).length
          )
            await git(validation, [
              "apply",
              "--cached",
              "--binary",
              initialIndex,
            ]);
        } finally {
          await git(workspace.directory, [
            "worktree",
            "remove",
            "--force",
            validation,
          ]);
        }
        const previousPatch = join(transfer, "previous.patch");
        await git(workspace.directory, [
          "diff",
          "--binary",
          "HEAD",
          `--output=${previousPatch}`,
        ]);
        await git(workspace.directory, [
          "diff",
          "--cached",
          "--binary",
          `--output=${join(transfer, "previous-index.patch")}`,
        ]);
        const previousExtras = await extras(workspace.directory);
        for (const file of previousExtras) {
          const backup = await safeDestination(
            join(transfer, "previous-files"),
            file,
          );
          await mkdir(dirname(backup), { recursive: true });
          await cp(await safeDestination(workspace.directory, file), backup, {
            dereference: false,
          });
        }
        await writeFile(
          join(transfer, "state.json"),
          JSON.stringify({
            previous: synchronized,
            next: head,
            previousExtras,
            incoming,
          }),
        );
        if ((await digest(workspace.directory, recovery)) !== expected)
          throw new OutpostError(
            "conflict",
            "Host workspace changed during synchronization",
            { recovery },
          );
        if ((await readFile(previousPatch)).length)
          await git(workspace.directory, [
            "apply",
            "--reverse",
            "--binary",
            previousPatch,
          ]);
        await git(workspace.directory, ["reset", "--mixed", "HEAD"]);
        for (const file of previousExtras.filter(
          (file) => !protectedFiles.includes(file),
        ))
          await rm(await safeDestination(workspace.directory, file), {
            force: true,
          });
        if (head !== synchronized)
          await git(workspace.directory, ["merge", "--ff-only", "FETCH_HEAD"]);
        if ((await readFile(patch)).length)
          await git(workspace.directory, ["apply", "--binary", patch]);
        if (
          !options.includeUncommitted &&
          (await readFile(initialPatch)).length
        )
          await git(workspace.directory, ["apply", "--binary", initialPatch]);
        if (
          !options.includeUncommitted &&
          (await readFile(initialIndex)).length
        )
          await git(workspace.directory, [
            "apply",
            "--cached",
            "--binary",
            initialIndex,
          ]);
        for (const file of incoming) {
          const target = await safeDestination(workspace.directory, file);
          await mkdir(dirname(target), { recursive: true });
          await cp(join(transfer, "incoming", file), target, {
            dereference: false,
          });
        }
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
