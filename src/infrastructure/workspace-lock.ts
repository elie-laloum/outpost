import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  readdir,
  realpath,
  rm,
  rmdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { invariant } from "../domain/errors.ts";
import { inside } from "./files.ts";
import {
  workspaceLocksDirectory,
  workspaceRegistryPendingDeleteAttempts,
  workspaceRegistryStaleMs,
} from "./workspace-lock.constants.ts";
import type {
  WorkspacePathLock,
  WorkspacePathRelease,
  WorkspacePathRecoveryOptions,
} from "./workspace-lock.types.ts";
import type { WorkspacePathGate } from "./workspace-lock.types.ts";
import { readInspectionFile } from "./inspection-file.ts";

export async function canonicalWorkspacePath(value: string): Promise<string> {
  const path = resolve(value);
  try {
    return await realpath(path);
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
    invariant(dirname(path) !== path, "Workspace path cannot be resolved");
    return join(
      await canonicalWorkspacePath(dirname(path)),
      path.slice(dirname(path).length + 1),
    );
  }
}

async function withRegistry<T>(action: () => Promise<T>): Promise<T> {
  await mkdir(workspaceLocksDirectory, { recursive: true, mode: 0o700 });
  const info = await lstat(workspaceLocksDirectory);
  invariant(
    info.isDirectory() &&
      !info.isSymbolicLink() &&
      (process.getuid === undefined || info.uid === process.getuid()),
    "Unsafe workspace lock registry",
  );
  const gate = join(workspaceLocksDirectory, "gate");
  let observed: string | undefined;
  let since = Date.now();
  let pendingDeletes = 0;
  for (;;) {
    try {
      await mkdir(gate, { mode: 0o700 });
    } catch (error) {
      if (
        pendingDeletion(error) &&
        ++pendingDeletes < workspaceRegistryPendingDeleteAttempts
      ) {
        await setTimeout(10);
        continue;
      }
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ))
        throw error;
      pendingDeletes = 0;
      // A gate that keeps changing belongs to live holders; only an unchanged one is reported.
      const current = await gateInstance(gate);
      if (current !== observed) since = Date.now();
      observed = current;
      if (current && Date.now() - since >= workspaceRegistryStaleMs)
        throw new Error(
          "Workspace lock registry is busy; inspect abandoned ownership before recovery",
        );
      await setTimeout(5 + Math.random() * 20);
      continue;
    }
    try {
      return await action();
    } finally {
      await rm(gate, { recursive: true, maxRetries: 5 });
    }
  }
}

async function gateInstance(gate: string): Promise<string | undefined> {
  const info = await lstat(gate, { bigint: true }).catch((error) => {
    if (
      (error instanceof Error && "code" in error && error.code === "ENOENT") ||
      pendingDeletion(error)
    )
      return undefined;
    throw error;
  });
  return info && `${info.dev}:${info.ino}:${info.birthtimeNs}:${info.ctimeNs}`;
}

// Windows reports EPERM while a just-released gate is pending deletion.
function pendingDeletion(error: unknown): boolean {
  return (
    process.platform === "win32" &&
    error instanceof Error &&
    "code" in error &&
    error.code === "EPERM"
  );
}

function parseLock(value: unknown): WorkspacePathLock {
  invariant(
    value &&
      typeof value === "object" &&
      "id" in value &&
      typeof value.id === "string" &&
      "directory" in value &&
      typeof value.directory === "string" &&
      "writable" in value &&
      typeof value.writable === "boolean",
    "Invalid workspace path lock",
  );
  const identity =
    "identity" in value ? parseIdentity(value.identity) : undefined;
  const ancestors =
    "ancestors" in value
      ? (() => {
          invariant(
            Array.isArray(value.ancestors) && value.ancestors.length <= 1024,
            "Invalid workspace lock ancestors",
          );
          return value.ancestors.map(parseIdentity);
        })()
      : undefined;
  const lockDirectory = value.directory;
  const excludedDirectories =
    "excludedDirectories" in value
      ? (() => {
          invariant(
            !value.writable &&
              Array.isArray(value.excludedDirectories) &&
              value.excludedDirectories.length <= 128,
            "Invalid workspace lock exclusions",
          );
          return value.excludedDirectories.map((path: unknown) => {
            invariant(
              typeof path === "string" &&
                path === resolve(path) &&
                path !== lockDirectory &&
                inside(lockDirectory, path),
              "Invalid workspace lock exclusion path",
            );
            return path;
          });
        })()
      : undefined;
  return {
    id: value.id,
    directory: value.directory,
    writable: value.writable,
    ...(identity ? { identity } : {}),
    ...(ancestors ? { ancestors } : {}),
    ...(excludedDirectories ? { excludedDirectories } : {}),
  };
}

function parseIdentity(value: unknown): WorkspacePathGate {
  invariant(
    value &&
      typeof value === "object" &&
      "device" in value &&
      typeof value.device === "number" &&
      "inode" in value &&
      typeof value.inode === "number",
    "Invalid workspace lock filesystem identity",
  );
  return { device: value.device, inode: value.inode };
}

async function readLock(path: string): Promise<WorkspacePathLock> {
  return parseLock(
    JSON.parse((await readInspectionFile(path, 256 * 1024)).toString("utf8")),
  );
}

async function pathIdentities(path: string) {
  const ancestors: WorkspacePathGate[] = [];
  let identity: WorkspacePathGate | undefined;
  for (let current = path; ; current = dirname(current)) {
    const info = await lstat(current).catch((error) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return undefined;
      throw error;
    });
    if (info) {
      const entry = { device: info.dev, inode: info.ino };
      ancestors.push(entry);
      if (current === path) identity = entry;
    }
    invariant(ancestors.length <= 1024, "Workspace path is too deep");
    if (dirname(current) === current) break;
  }
  return { ...(identity ? { identity } : {}), ancestors };
}

function containsIdentity(
  identities: readonly WorkspacePathGate[] | undefined,
  target: WorkspacePathGate | undefined,
): boolean {
  return (
    !!target &&
    !!identities?.some(
      (identity) =>
        identity.device === target.device && identity.inode === target.inode,
    )
  );
}

export async function lockWorkspacePath(
  value: string,
  writable: boolean,
): Promise<WorkspacePathRelease> {
  return acquireWorkspacePath(value, writable);
}

export async function lockWorkspaceCopySource(
  value: string,
  runtimeDirectory: string,
): Promise<WorkspacePathRelease> {
  const source = await canonicalWorkspacePath(value);
  const runtime = await canonicalWorkspacePath(runtimeDirectory);
  return acquireWorkspacePath(
    source,
    false,
    inside(source, runtime) && source !== runtime ? [runtime] : [],
  );
}

async function acquireWorkspacePath(
  value: string,
  writable: boolean,
  excludedDirectories: readonly string[] = [],
): Promise<WorkspacePathRelease> {
  const directory = await canonicalWorkspacePath(value);
  const id = randomUUID();
  const identities = await pathIdentities(directory);
  const path = join(workspaceLocksDirectory, `${id}.json`);
  await withRegistry(async () => {
    for (const name of await readdir(workspaceLocksDirectory)) {
      if (!name.endsWith(".json")) continue;
      const existing = await readLock(join(workspaceLocksDirectory, name));
      if (
        existing.excludedDirectories?.some((excluded) =>
          inside(excluded, directory),
        ) ||
        excludedDirectories.some((excluded) =>
          inside(excluded, existing.directory),
        )
      )
        continue;
      if (!(writable || existing.writable)) continue;
      // Recorded inodes count only while the locked path still resolves to them; deleted ones get reused.
      const current = await pathIdentities(existing.directory);
      const identity = containsIdentity(
        current.identity ? [current.identity] : [],
        existing.identity,
      )
        ? existing.identity
        : undefined;
      const ancestors = existing.ancestors?.filter((entry) =>
        containsIdentity(current.ancestors, entry),
      );
      invariant(
        !(
          inside(directory, existing.directory) ||
          inside(existing.directory, directory) ||
          containsIdentity(identities.ancestors, identity) ||
          containsIdentity(ancestors, identities.identity)
        ),
        "Workspace path overlaps an active writer",
      );
    }
    await writeFile(
      path,
      JSON.stringify({
        id,
        directory,
        writable,
        ...identities,
        ...(excludedDirectories.length ? { excludedDirectories } : {}),
      }),
      { flag: "wx", mode: 0o600 },
    );
  });
  let released = false;
  return Object.assign(
    async () => {
      if (released) return;
      await withRegistry(async () => {
        const current = await readLock(path);
        invariant(current.id === id, "Workspace path lock ownership changed");
        await rm(path);
      });
      released = true;
    },
    { id, directory },
  );
}

export async function inspectWorkspacePathLocks(): Promise<
  readonly WorkspacePathLock[]
> {
  return withRegistry(async () => {
    const locks = [];
    for (const name of await readdir(workspaceLocksDirectory)) {
      if (name.endsWith(".json"))
        locks.push(await readLock(join(workspaceLocksDirectory, name)));
    }
    return locks;
  });
}

export async function recoverWorkspacePathLock(
  id: string,
  expectedDirectory: string,
  options: WorkspacePathRecoveryOptions,
): Promise<void> {
  invariant(
    options.processesStopped === true && /^[a-f0-9-]{36}$/.test(id),
    "Workspace lock recovery requires explicit stopped-process authorization",
  );
  const directory = await canonicalWorkspacePath(expectedDirectory);
  await withRegistry(async () => {
    const path = join(workspaceLocksDirectory, `${id}.json`);
    const lock = await readLock(path);
    invariant(
      lock.id === id && lock.directory === directory,
      "Workspace lock recovery identity mismatch",
    );
    await rm(path);
  });
}

export async function inspectWorkspaceRegistryGate(): Promise<
  WorkspacePathGate | undefined
> {
  const info = await lstat(join(workspaceLocksDirectory, "gate")).catch(
    (error) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        return undefined;
      throw error;
    },
  );
  invariant(
    !info || (info.isDirectory() && !info.isSymbolicLink()),
    "Unsafe workspace registry gate",
  );
  return info ? { device: info.dev, inode: info.ino } : undefined;
}

export async function recoverWorkspaceRegistryGate(
  expected: WorkspacePathGate,
  options: WorkspacePathRecoveryOptions,
): Promise<void> {
  invariant(
    options.processesStopped === true,
    "Registry recovery requires explicit stopped-process authorization",
  );
  const current = await inspectWorkspaceRegistryGate();
  invariant(
    current?.device === expected.device && current.inode === expected.inode,
    "Workspace registry gate changed",
  );
  await rmdir(join(workspaceLocksDirectory, "gate"));
}
