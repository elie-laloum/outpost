import { constants } from "node:fs";
import { chmod, lstat, mkdir, open, rmdir } from "node:fs/promises";
import { posix } from "node:path";
import { invariant } from "../domain/errors.ts";
import type { WorkspaceFileEntry } from "../domain/file-workspace.types.ts";
import { safeDestination } from "../infrastructure/files.ts";
import type {
  PublicationDirectory,
  PublicationJournal,
} from "./workspace-publication.types.ts";

export async function planPublicationDirectories(
  destination: string,
  entries: readonly WorkspaceFileEntry[],
): Promise<PublicationDirectory[]> {
  const modes = new Map<string, number>([[".", 0o700]]);
  for (const entry of entries) {
    if (entry.kind === "directory") modes.set(entry.path, entry.mode);
    for (
      let path = posix.dirname(entry.path);
      path !== ".";
      path = posix.dirname(path)
    )
      if (!modes.has(path)) modes.set(path, 0o700);
  }
  const planned: PublicationDirectory[] = [];
  for (const [path, mode] of [...modes].sort(([a], [b]) => {
    if (a === b) return 0;
    if (a === ".") return -1;
    if (b === ".") return 1;
    return a.split("/").length - b.split("/").length || a.localeCompare(b);
  })) {
    const target = await safeDestination(destination, path);
    const info = await lstat(target).catch((error) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return undefined;
      throw error;
    });
    invariant(
      !info || (info.isDirectory() && !info.isSymbolicLink()),
      "Publication has an ambiguous file/directory transformation",
    );
    if (
      info &&
      entries.some((entry) => entry.path === path && entry.kind === "directory")
    )
      invariant(
        (info.mode & 0o777) === mode,
        "Existing publication directory mode differs; use a new destination",
      );
    if (!info) planned.push({ path, mode, phase: "pending" });
  }
  return planned;
}

export async function applyPublicationDirectories(
  journal: PublicationJournal,
  save: () => Promise<void>,
): Promise<void> {
  for (const directory of journal.directories ?? []) {
    invariant(
      directory.phase !== "restored",
      "A restored directory cannot be finished",
    );
    const target = await safeDestination(
      journal.options.destination,
      directory.path,
    );
    if (directory.phase === "pending" || directory.phase === "create-intent") {
      directory.phase = "create-intent";
      await save();
      await mkdir(target, { mode: 0o700 });
      const created = await lstat(target);
      directory.identity = { device: created.dev, inode: created.ino };
      directory.createdMode = created.mode & 0o777;
      directory.phase = "created";
      await save();
    }
    const info = await lstat(target);
    invariant(
      info.isDirectory() &&
        info.dev === directory.identity?.device &&
        info.ino === directory.identity.inode,
      "Publication directory was replaced",
    );
    invariant(
      (info.mode & 0o777) === directory.mode ||
        (directory.phase === "created" &&
          (info.mode & 0o777) === directory.createdMode),
      "Publication directory mode changed",
    );
  }
}

export async function settlePublicationDirectories(
  journal: PublicationJournal,
  save: () => Promise<void>,
): Promise<void> {
  for (const directory of [...(journal.directories ?? [])].reverse()) {
    const target = await safeDestination(
      journal.options.destination,
      directory.path,
    );
    const info = await lstat(target);
    invariant(
      info.isDirectory() &&
        info.dev === directory.identity?.device &&
        info.ino === directory.identity.inode,
      "Publication directory was replaced",
    );
    invariant(
      (info.mode & 0o777) === directory.mode ||
        (directory.phase === "created" &&
          (info.mode & 0o777) === directory.createdMode),
      "Publication directory mode changed",
    );
    if (directory.phase === "settled") continue;
    if (process.platform === "win32") {
      await chmod(target, directory.mode);
      directory.phase = "settled";
      await save();
      continue;
    }
    const handle = await open(
      target,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    try {
      const current = await handle.stat();
      invariant(
        current.isDirectory() &&
          current.dev === directory.identity?.device &&
          current.ino === directory.identity.inode,
        "Publication directory was replaced",
      );
      await handle.chmod(directory.mode);
    } finally {
      await handle.close();
    }
    directory.phase = "settled";
    await save();
  }
}

export async function preparePublicationRollback(
  journal: PublicationJournal,
): Promise<boolean> {
  if (process.platform === "win32") return true;
  let complete = true;
  for (const directory of journal.directories ?? []) {
    if (
      !directory.identity ||
      directory.createdMode === undefined ||
      directory.phase === "restored"
    )
      continue;
    try {
      const target = await safeDestination(
        journal.options.destination,
        directory.path,
      );
      const handle = await open(
        target,
        constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
      );
      try {
        const current = await handle.stat();
        invariant(
          current.isDirectory() &&
            current.dev === directory.identity.device &&
            current.ino === directory.identity.inode &&
            ((current.mode & 0o777) === directory.mode ||
              (current.mode & 0o777) === directory.createdMode),
          "Publication directory changed before rollback",
        );
        await handle.chmod(directory.createdMode);
      } finally {
        await handle.close();
      }
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        continue;
      complete = false;
    }
  }
  return complete;
}

export async function verifyPublicationDirectories(
  journal: PublicationJournal,
): Promise<void> {
  for (const directory of journal.directories ?? []) {
    const info = await lstat(
      await safeDestination(journal.options.destination, directory.path),
    );
    invariant(
      info.isDirectory() &&
        info.dev === directory.identity?.device &&
        info.ino === directory.identity.inode &&
        (info.mode & 0o777) === directory.mode,
      "Publication directory verification failed",
    );
  }
}

export async function rollbackPublicationDirectories(
  journal: PublicationJournal,
  save: () => Promise<void>,
): Promise<boolean> {
  let complete = true;
  for (const directory of [...(journal.directories ?? [])].reverse()) {
    if (directory.phase === "pending" || directory.phase === "restored")
      continue;
    try {
      const target = await safeDestination(
        journal.options.destination,
        directory.path,
      );
      const info = await lstat(target).catch((error) => {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        )
          return undefined;
        throw error;
      });
      if (info) {
        invariant(
          info.isDirectory() &&
            info.dev === directory.identity?.device &&
            info.ino === directory.identity.inode,
          "Publication directory changed during rollback",
        );
        invariant(
          (info.mode & 0o777) === directory.mode ||
            (info.mode & 0o777) === directory.createdMode,
          "Publication directory mode changed during rollback",
        );
        await rmdir(target);
      }
      directory.phase = "restored";
      await save();
    } catch {
      complete = false;
    }
  }
  return complete;
}
