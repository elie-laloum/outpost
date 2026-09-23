import { createHash } from "node:crypto";
import { lstat, readFile, readlink } from "node:fs/promises";
import { join } from "node:path";
import { safeDestination } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";

export async function extras(directory: string): Promise<string[]> {
  return (
    await git(directory, ["ls-files", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter((file) => file && !file.startsWith(".outpost/"));
}

export async function digest(
  directory: string,
  recovery: string,
): Promise<string> {
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
