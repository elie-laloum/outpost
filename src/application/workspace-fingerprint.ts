import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { lstat, readlink } from "node:fs/promises";
import { join } from "node:path";
import { safeDestination } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { OutpostError } from "../domain/errors.ts";

export function validateUntrackedFiles(files: readonly string[]): void {
  for (const file of files)
    if (file.endsWith("/"))
      throw new OutpostError(
        "conflict",
        "Untracked nested repositories cannot be synchronized; move or ignore the nested repository",
        { file },
      );
}

export async function extras(directory: string): Promise<string[]> {
  const files = (
    await git(directory, ["ls-files", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter((file) => file && !file.startsWith(".outpost/"));
  validateUntrackedFiles(files);
  return files;
}

export async function digest(
  directory: string,
  recovery: string,
): Promise<string> {
  const hash = createHash("sha256");
  hash.update(await git(directory, ["rev-parse", "HEAD"]));
  const patch = join(recovery, "fingerprint.patch");
  await git(directory, ["diff", "--binary", "HEAD", `--output=${patch}`]);
  for await (const chunk of createReadStream(patch)) hash.update(chunk);
  hash.update(await git(directory, ["diff", "--cached", "--binary"]));
  for (const file of await extras(directory)) {
    const path = await safeDestination(directory, file),
      info = await lstat(path);
    hash.update(file).update(String(info.mode));
    if (info.isSymbolicLink()) {
      hash.update(await readlink(path));
      continue;
    }
    for await (const chunk of createReadStream(path)) hash.update(chunk);
  }
  return hash.digest("hex");
}
