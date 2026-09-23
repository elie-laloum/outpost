import {
  chmod,
  copyFile,
  rm,
  lstat,
  mkdir,
  readdir,
  readlink,
  symlink,
} from "node:fs/promises";
import { dirname, join, parse, resolve } from "node:path";
import { OutpostError } from "../domain/errors.ts";

export async function transferDestination(destination: string): Promise<void> {
  const absolute = resolve(destination);
  for (let path = absolute; path !== parse(path).root; path = dirname(path)) {
    const info = await lstat(path).catch((cause: NodeJS.ErrnoException) => {
      if (cause.code === "ENOENT") return undefined;
      throw cause;
    });
    if (info?.isSymbolicLink())
      throw new OutpostError(
        "provider",
        "Transfer destination traverses a symlink",
        { destination },
      );
  }
}

export async function copyTransfer(
  source: string,
  destination: string,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted();
  await transferDestination(destination);
  const info = await lstat(source);
  if (info.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const name of await readdir(source))
      await copyTransfer(join(source, name), join(destination, name), signal);
    await chmod(destination, info.mode & 0o777);
    return;
  }
  await mkdir(dirname(destination), { recursive: true });
  if (info.isSymbolicLink()) {
    await symlink(await readlink(source), destination);
    return;
  }
  if (!info.isFile())
    throw new OutpostError("provider", "Unsupported transfer file type", {
      source,
    });
  await copyFile(source, destination);
  await chmod(destination, info.mode & 0o777);
}

export async function removeTransferDirectory(root: string): Promise<void> {
  async function writable(path: string): Promise<void> {
    const info = await lstat(path);
    if (!info.isDirectory() || info.isSymbolicLink()) return;
    await chmod(path, 0o700);
    for (const name of await readdir(path)) await writable(join(path, name));
  }
  await writable(root);
  await rm(root, { recursive: true, force: true });
}
