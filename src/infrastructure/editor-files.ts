import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import { replaceFile } from "./file-replacement.ts";
import type {
  EditorDirectoryEntry,
  EditorFile,
  EditorRoot,
} from "./editor-files.types.ts";

export function editorFileHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function outside(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path);
}

async function nearestExisting(path: string): Promise<string> {
  for (let current = path; ; current = dirname(current)) {
    try {
      return await realpath(current);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      if (dirname(current) === current) throw error;
    }
  }
}

/** Confines editor file access to one directory, including through symbolic links. */
export async function openEditorRoot(directory: string): Promise<EditorRoot> {
  const root = await realpath(resolve(directory));
  if (!(await lstat(root)).isDirectory())
    throw new Error(`${directory} is not a directory`);
  async function locate(file: string): Promise<string> {
    const target = resolve(root, file);
    if (outside(root, target) || target === root)
      throw new OutpostError(
        "configuration",
        `${file} is outside the editor directory`,
      );
    if (relative(root, target).split(sep).includes(".git"))
      throw new OutpostError(
        "configuration",
        "The editor never writes Git metadata",
      );
    if (outside(root, await nearestExisting(target)))
      throw new OutpostError(
        "configuration",
        `${file} resolves outside the editor directory`,
      );
    return target;
  }
  return {
    directory: root,
    locate,
    relative: (path) => relative(root, path).split(sep).join("/"),
  };
}

export async function readEditorFile(
  root: EditorRoot,
  file: string,
  limit: number,
): Promise<EditorFile | undefined> {
  const path = await root.locate(file);
  let info;
  try {
    info = await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
  if (!info.isFile()) throw new Error(`${file} is not a regular file`);
  if (info.size > limit) throw new Error(`${file} exceeds ${limit} bytes`);
  const text = await readFile(path, "utf8");
  return { path: root.relative(path), text, hash: editorFileHash(text) };
}

/** Replaces a file only while it keeps the `expected` hash; `null` requires a new file. */
export async function writeEditorFile(
  root: EditorRoot,
  file: string,
  text: string,
  expected: string | null,
): Promise<EditorFile> {
  const path = await root.locate(file);
  const current = await readEditorFile(root, file, Number.MAX_SAFE_INTEGER);
  if ((current?.hash ?? null) !== expected)
    throw new OutpostError(
      "conflict",
      `${file} changed on disk since it was opened`,
    );
  const mode = current ? (await lstat(path)).mode & 0o777 : 0o644;
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.outpost-editor-${randomUUID()}`);
  try {
    await writeFile(temporary, text, { flag: "wx", mode });
    await replaceFile(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
  return { path: root.relative(path), text, hash: editorFileHash(text) };
}

/** Lists one directory for the file chooser, hiding dependencies, Git metadata and dotfiles. */
export async function listEditorDirectory(
  root: EditorRoot,
  directory: string,
  limit: number,
): Promise<readonly EditorDirectoryEntry[]> {
  const path = directory ? await root.locate(directory) : root.directory;
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules" &&
        (entry.isDirectory() || entry.isFile()),
    )
    .map((entry) => ({
      name: entry.name,
      path: root.relative(join(path, entry.name)),
      kind: entry.isDirectory() ? ("directory" as const) : ("file" as const),
    }))
    .sort(
      (a, b) =>
        Number(b.kind === "directory") - Number(a.kind === "directory") ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}
