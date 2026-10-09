import { execFile } from "node:child_process";
import { lstat, realpath } from "node:fs/promises";
import { promisify } from "node:util";
import { join, resolve } from "node:path";

export async function prepareDemoRepository(
  directory: string,
  signal: AbortSignal,
) {
  const repository = await realpath(join(directory, "repo"));
  const metadata = await lstat(join(repository, ".git")).catch((error) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return undefined;
    throw error;
  });
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, {
      cwd: repository,
      signal,
      encoding: "utf8",
      timeout: 15_000,
    });
  if (metadata) {
    if (!metadata.isDirectory() || metadata.isSymbolicLink())
      throw new Error("The demo repository must have its own .git directory");
    if (
      resolve((await git("rev-parse", "--show-toplevel")).stdout.trim()) !==
      repository
    )
      throw new Error("The demo must use a separate Git repository");
    await git("rev-parse", "--verify", "HEAD");
    return;
  }
  await git("init", "-b", "main");
  await git("config", "user.name", "Outpost Linear Demo");
  await git("config", "user.email", "linear-demo@outpost.invalid");
  await git("add", ".gitignore", "package.json", "src", "test");
  await git(
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "-m",
    "Initialize TypeScript demo",
  );
}
