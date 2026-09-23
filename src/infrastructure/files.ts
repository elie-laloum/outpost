import { cp, lstat, mkdir, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { homedir } from "node:os";
import { OutpostError } from "../domain/errors.ts";

export function expandPath(value: string, base = process.cwd()): string {
  const expanded =
    value === "~"
      ? homedir()
      : /^~[\\/]/.test(value)
        ? resolve(homedir(), value.slice(2))
        : value;
  return resolve(base, expanded);
}

export async function directory(value = process.cwd()): Promise<string> {
  const path = expandPath(value);
  try {
    if (!(await stat(path)).isDirectory()) throw new Error("Not a directory");
    return await realpath(path);
  } catch (cause) {
    throw new OutpostError(
      "workspace",
      `Directory is unavailable: ${path}`,
      { path },
      cause,
    );
  }
}

export function inside(root: string, path: string): boolean {
  const rel = relative(resolve(root), resolve(path));
  return (
    rel === "" ||
    (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`))
  );
}

export async function safeDestination(
  root: string,
  entry: string,
): Promise<string> {
  if (
    !entry ||
    isAbsolute(entry) ||
    entry
      .split(/[\\/]/)
      .some((part) => part === ".." || part.toLowerCase() === ".git") ||
    entry.includes("\0")
  )
    throw new OutpostError("workspace", `Unsafe workspace path: ${entry}`);
  const target = resolve(root, entry);
  if (!inside(root, target))
    throw new OutpostError("workspace", "Path escapes workspace");
  let parent = dirname(target);
  while (inside(root, parent)) {
    const info = await lstat(parent).catch((error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    });
    if (info?.isSymbolicLink())
      throw new OutpostError(
        "workspace",
        `Workspace path traverses a symlink: ${entry}`,
      );
    if (resolve(parent) === resolve(root)) break;
    parent = dirname(parent);
  }
  return target;
}

export async function copySelected(
  source: string,
  target: string,
  entries: readonly string[],
  deadlineMs = 60_000,
): Promise<void> {
  const started = Date.now();
  for (const entry of entries) {
    if (
      !entry ||
      isAbsolute(entry) ||
      entry.split(/[\\/]/).some((part) => part === ".." || part === ".git")
    )
      throw new OutpostError("configuration", `Unsafe copied path: ${entry}`);
    const from = await safeDestination(source, entry),
      to = await safeDestination(target, entry);
    if (!inside(source, from) || !inside(target, to))
      throw new OutpostError(
        "configuration",
        "Copy must stay within workspace boundaries",
      );
    if (!(await lstat(from).catch(() => undefined)))
      throw new OutpostError("workspace", `Copy source is missing: ${entry}`);
    await mkdir(dirname(to), { recursive: true });
    await cp(from, to, {
      recursive: true,
      force: true,
      dereference: false,
      filter: () => {
        if (Date.now() - started > deadlineMs)
          throw new OutpostError(
            "timeout",
            "Workspace copy deadline exceeded",
            { deadlineMs },
          );
        return true;
      },
    });
  }
}
