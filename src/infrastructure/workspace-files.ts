import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readdir,
  readlink,
  stat,
  symlink,
} from "node:fs/promises";
import { dirname, isAbsolute, matchesGlob, posix, resolve } from "node:path";
import { invariant } from "../domain/errors.ts";
import type { WorkspaceFileEntry } from "../domain/file-workspace.types.ts";
import { fileManifest, validateFilePaths } from "./file-manifest.ts";
import { inside, safeDestination } from "./files.ts";
import {
  workspaceExcludedNames,
  workspaceFileLimits,
} from "./workspace-files.constants.ts";
import { inspectionFileFlags } from "./inspection-file.constants.ts";

export function validateWorkspaceSelection(paths: readonly string[]): void {
  invariant(paths.length > 0, "Workspace selection must not be empty");
  validateFilePaths(paths);
  invariant(
    paths.every((path) => !isAbsolute(path) && !/^[A-Za-z]:/.test(path)),
    "Workspace selection must use relative portable paths",
  );
  invariant(
    paths.every(
      (path) =>
        !path
          .split("/")
          .some((part) => workspaceExcludedNames.has(part.toLowerCase())),
    ),
    "Workspace selection includes control metadata",
  );
}

export function selectedWorkspacePath(
  path: string,
  paths?: readonly string[],
): boolean {
  return (
    !paths ||
    paths.some(
      (pattern) => matchesGlob(path, pattern) || path.startsWith(`${pattern}/`),
    )
  );
}

export function workspaceManifestFingerprint(
  entries: readonly WorkspaceFileEntry[],
  paths?: readonly string[],
): string {
  return createHash("sha256")
    .update(JSON.stringify({ paths: paths ?? null, entries }))
    .digest("hex");
}

function validateCapturedWorkspaceLinks(
  entries: readonly WorkspaceFileEntry[],
): void {
  const selected = new Map(entries.map((entry) => [entry.path, entry]));
  const directories = new Set<string>();
  for (const entry of entries)
    for (
      let path = posix.dirname(entry.path);
      path !== ".";
      path = posix.dirname(path)
    )
      directories.add(path);
  for (const entry of entries) {
    if (entry.kind !== "link") continue;
    invariant(entry.target !== undefined, "Missing workspace link target");
    let pending = [
      ...posix.dirname(entry.path).split("/"),
      ...entry.target.split("/"),
    ];
    const resolved: string[] = [];
    const visited = new Set<string>();
    let redirects = 0;
    while (pending.length) {
      const part = pending.shift();
      if (!part || part === ".") continue;
      if (part === "..") {
        invariant(
          resolved.length,
          `Workspace link escapes selection: ${entry.path}`,
        );
        resolved.pop();
        continue;
      }
      const path = [...resolved, part].join("/");
      const target = selected.get(path);
      invariant(
        target || directories.has(path),
        `Workspace link target is outside the captured selection: ${entry.path}`,
      );
      if (target?.kind === "link") {
        invariant(target.target !== undefined, "Missing workspace link target");
        const state = JSON.stringify([path, pending]);
        if (visited.has(state)) break;
        visited.add(state);
        invariant(
          ++redirects <= 64,
          "Workspace link exceeds its resolution limit",
        );
        pending = [...target.target.split("/"), ...pending];
        continue;
      }
      invariant(
        !pending.length ||
          target?.kind === "directory" ||
          directories.has(path),
        `Workspace link traverses a file: ${entry.path}`,
      );
      resolved.push(part);
    }
  }
}

export async function workspaceManifest(
  root: string,
  paths?: readonly string[],
  signal?: AbortSignal,
  excludedRoots: readonly string[] = [],
): Promise<WorkspaceFileEntry[]> {
  if (paths) validateWorkspaceSelection(paths);
  const entries: WorkspaceFileEntry[] = [];
  let bytes = 0;
  let visited = 0;
  const visit = async (parent: string): Promise<void> => {
    signal?.throwIfAborted();
    const directory = resolve(root, parent);
    const before = await lstat(directory);
    invariant(
      before.isDirectory() && !before.isSymbolicLink(),
      "Workspace root must be a directory",
    );
    const names = (await readdir(directory)).sort();
    for (const name of names) {
      if (workspaceExcludedNames.has(name.toLowerCase())) continue;
      invariant(
        ++visited <= workspaceFileLimits.entries,
        "Workspace exceeds traversal entry limit",
      );
      const path = parent ? `${parent}/${name}` : name;
      if (
        excludedRoots.some((excluded) => inside(excluded, resolve(root, path)))
      )
        continue;
      validateFilePaths([path]);
      const file = await safeDestination(root, path);
      const info = await lstat(file);
      if (info.isDirectory()) {
        if (selectedWorkspacePath(path, paths))
          entries.push({
            path,
            kind: "directory",
            mode: info.mode & 0o777,
            size: 0,
            sha256: "",
          });
        await visit(path);
        continue;
      }
      if (!selectedWorkspacePath(path, paths)) continue;
      invariant(
        info.isFile() || info.isSymbolicLink(),
        `Unsupported workspace file: ${path}`,
      );
      const manifest = await fileManifest(root, path, signal);
      const after = await lstat(file);
      invariant(
        info.dev === after.dev &&
          info.ino === after.ino &&
          info.size === after.size &&
          info.mtimeMs === after.mtimeMs &&
          info.ctimeMs === after.ctimeMs,
        `Workspace changed during capture: ${path}`,
      );
      let target: string | undefined;
      if (info.isSymbolicLink()) {
        target = await readlink(file);
        if (process.platform === "win32") target = target.replaceAll("\\", "/");
        invariant(
          !isAbsolute(target) &&
            !target.includes("\\") &&
            inside(root, resolve(dirname(file), target)),
          `Workspace link escapes selection: ${path}`,
        );
        const linkPath = posix.normalize(
          posix.join(posix.dirname(path), target),
        );
        invariant(
          !linkPath
            .split("/")
            .some((part) => workspaceExcludedNames.has(part.toLowerCase())) &&
            selectedWorkspacePath(linkPath, paths),
          `Workspace link escapes selection: ${path}`,
        );
      }
      bytes += manifest.size;
      invariant(
        entries.length < workspaceFileLimits.entries &&
          bytes <= workspaceFileLimits.bytes,
        "Workspace exceeds capture limits",
      );
      entries.push({
        ...manifest,
        ...(target === undefined ? {} : { target }),
      });
    }
    const after = await lstat(directory);
    invariant(
      before.dev === after.dev &&
        before.ino === after.ino &&
        before.mtimeMs === after.mtimeMs &&
        before.ctimeMs === after.ctimeMs,
      "Workspace directory changed during capture",
    );
  };
  await visit("");
  invariant(
    entries.length <= workspaceFileLimits.entries,
    "Workspace exceeds entry limit",
  );
  validateCapturedWorkspaceLinks(entries);
  return entries.sort((a, b) => a.path.localeCompare(b.path, "en"));
}

export async function copyWorkspaceManifest(
  source: string,
  destination: string,
  entries: readonly WorkspaceFileEntry[],
  signal?: AbortSignal,
): Promise<void> {
  signal?.throwIfAborted();
  await mkdir(destination, { recursive: true, mode: 0o700 });
  for (const entry of entries) {
    signal?.throwIfAborted();
    const target = await safeDestination(destination, entry.path);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    if (entry.kind === "directory") {
      await mkdir(target, { recursive: true, mode: 0o700 });
      continue;
    }
    if (entry.kind === "link") {
      invariant(entry.target !== undefined, "Missing workspace link target");
      let type: "dir" | "file" | undefined;
      if (process.platform === "win32") {
        const info = await stat(
          await safeDestination(source, entry.path),
        ).catch((error: unknown) => {
          if (
            error instanceof Error &&
            "code" in error &&
            (error.code === "ENOENT" || error.code === "ELOOP")
          )
            return undefined;
          throw error;
        });
        type = info?.isDirectory() ? "dir" : "file";
      }
      await symlink(entry.target, target, type);
      continue;
    }
    const original = await open(
      await safeDestination(source, entry.path),
      inspectionFileFlags,
    );
    try {
      const before = await original.stat();
      invariant(
        before.isFile() && before.size === entry.size,
        "Workspace copy source changed",
      );
      const copied = await open(target, "wx", 0o600);
      const hash = createHash("sha256");
      try {
        if (entry.size > 0)
          for await (const bytes of original.createReadStream({
            autoClose: false,
            end: entry.size - 1,
          })) {
            signal?.throwIfAborted();
            hash.update(bytes);
            await copied.writeFile(bytes);
          }
        await copied.sync();
      } finally {
        await copied.close();
      }
      const after = await original.stat();
      invariant(
        before.size === after.size &&
          before.mtimeMs === after.mtimeMs &&
          before.ctimeMs === after.ctimeMs &&
          hash.digest("hex") === entry.sha256,
        "Workspace copy source changed",
      );
    } finally {
      await original.close();
    }
    await chmod(target, entry.mode);
  }
  for (const entry of [...entries].reverse()) {
    signal?.throwIfAborted();
    if (entry.kind === "directory")
      await chmod(await safeDestination(destination, entry.path), entry.mode);
  }
}
