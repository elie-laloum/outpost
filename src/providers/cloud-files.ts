import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readdir,
  symlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import { safeDestination } from "../infrastructure/files.ts";

export async function uploadTree(
  source: string,
  destination: string,
  upload: (path: string, data: Buffer) => Promise<void>,
  link: (target: string, path: string) => Promise<void>,
  metadata?: (path: string, directory: boolean, mode: number) => Promise<void>,
  signal?: AbortSignal,
): Promise<void> {
  signal?.throwIfAborted();
  const info = await lstat(source);
  if (info.isSymbolicLink()) {
    const { readlink } = await import("node:fs/promises");
    await link(await readlink(source), destination);
    return;
  }
  if (info.isDirectory()) {
    await metadata?.(destination, true, info.mode & 0o777);
    for (const entry of await readdir(source))
      await uploadTree(
        join(source, entry),
        posix.join(destination, entry),
        upload,
        link,
        metadata,
        signal,
      );
    return;
  }
  if (!info.isFile())
    throw new OutpostError("provider", `Unsupported upload input: ${source}`);
  const data = await readFile(source);
  signal?.throwIfAborted();
  await upload(destination, data);
  signal?.throwIfAborted();
  await metadata?.(destination, false, info.mode & 0o777);
}

export async function saveDownload(
  destination: string,
  data: Buffer,
): Promise<void> {
  await mkdir(dirname(destination), { recursive: true });
  if ((await lstat(destination).catch(() => undefined))?.isSymbolicLink())
    throw new OutpostError("provider", "Refusing to overwrite a local symlink");
  await writeFile(destination, data);
}

export const manifestScript = `const f=require('node:fs'),p=require('node:path'),root=process.argv[1],items=[];function walk(path,relative){const s=f.lstatSync(path),kind=s.isSymbolicLink()?'link':s.isDirectory()?'directory':s.isFile()?'file':'unsupported';items.push({path:relative,kind,mode:s.mode&511,...(kind==='link'?{target:f.readlinkSync(path)}:{})});if(kind==='directory')for(const name of f.readdirSync(path))walk(p.join(path,name),relative?relative+'/'+name:name)}walk(root,'');console.log(JSON.stringify(items))`;

export async function downloadTree(
  source: string,
  destination: string,
  manifest: string,
  read: (path: string) => Promise<Buffer>,
  signal?: AbortSignal,
): Promise<void> {
  const entries: unknown = JSON.parse(manifest);
  if (!Array.isArray(entries))
    throw new OutpostError("provider", "Invalid transfer manifest");
  for (const entry of entries) {
    signal?.throwIfAborted();
    if (
      !entry ||
      typeof entry.path !== "string" ||
      !Number.isSafeInteger(entry.mode)
    )
      throw new OutpostError("provider", "Invalid transfer entry");
    const target = entry.path
      ? await safeDestination(destination, entry.path)
      : destination;
    if ((await lstat(target).catch(() => undefined))?.isSymbolicLink())
      throw new OutpostError(
        "provider",
        "Refusing to overwrite a local symlink",
      );
    if (entry.kind === "directory") {
      await mkdir(target, { recursive: true });
    } else if (entry.kind === "file") {
      const data = await read(posix.join(source, entry.path));
      signal?.throwIfAborted();
      await saveDownload(target, data);
      await chmod(target, entry.mode & 0o777);
    } else if (entry.kind === "link" && typeof entry.target === "string") {
      await mkdir(dirname(target), { recursive: true });
      await symlink(entry.target, target);
    } else throw new OutpostError("provider", "Unsupported remote file type");
  }
}
