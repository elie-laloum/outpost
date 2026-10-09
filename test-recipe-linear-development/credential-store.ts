import { constants } from "node:fs";
import { lstat, mkdir, open, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { linearLimits } from "./linear.constants.ts";

function missing(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function privateDirectory(file: string) {
  const directory = dirname(file);
  await mkdir(directory, { mode: 0o700 }).catch((error) => {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST"))
      throw error;
  });
  const metadata = await lstat(directory);
  if (
    metadata.isSymbolicLink() ||
    !metadata.isDirectory() ||
    (process.platform !== "win32" && metadata.mode & 0o077)
  )
    throw new Error(
      "Credential directory must be a private directory owned by the current user",
    );
  if (process.getuid && metadata.uid !== process.getuid())
    throw new Error("Credential directory has a different owner");
}

export async function readLinearToken(
  file: string,
): Promise<string | undefined> {
  await privateDirectory(file);
  const metadata = await lstat(file).catch((error) => {
    if (missing(error)) return undefined;
    throw error;
  });
  if (!metadata) return undefined;
  if (
    !metadata.isFile() ||
    metadata.isSymbolicLink() ||
    metadata.size > linearLimits.tokenBytes ||
    (process.platform !== "win32" && metadata.mode & 0o077)
  )
    throw new Error("Credential file must be a small private regular file");
  const handle = await open(
    file,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const actual = await handle.stat();
    if (
      actual.ino !== metadata.ino ||
      actual.dev !== metadata.dev ||
      (process.getuid && actual.uid !== process.getuid())
    )
      throw new Error("Credential file changed or has a different owner");
    const bytes = Buffer.alloc(linearLimits.tokenBytes + 1);
    const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0);
    if (bytesRead > linearLimits.tokenBytes)
      throw new Error("Credential file is too large");
    return bytes.subarray(0, bytesRead).toString("utf8").trim() || undefined;
  } finally {
    await handle.close();
  }
}

export async function saveLinearToken(file: string, token: string) {
  await privateDirectory(file);
  const previous = await lstat(file).catch((error) => {
    if (missing(error)) return undefined;
    throw error;
  });
  if (previous && (!previous.isFile() || previous.isSymbolicLink()))
    throw new Error("Refusing to replace a credential link or non-file");
  const temporary = join(dirname(file), `.token-${randomUUID()}`);
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(token, "utf8");
    await handle.sync();
    await handle.close();
    await rename(temporary, file);
  } finally {
    await handle.close();
    await rm(temporary, { force: true });
  }
}
