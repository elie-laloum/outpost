import { lstat, mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { invariant } from "../domain/errors.ts";
import type { Command } from "../domain/command.types.ts";
import { requireSuccess } from "./process.ts";
import type { ScriptedRecipe } from "./scripted-turn.types.ts";

export async function applyScriptedCommit(
  root: string,
  commit: NonNullable<ScriptedRecipe["commit"]>,
  command: Command,
): Promise<void> {
  const paths = Object.keys(commit.files);
  for (const path of paths) {
    let current = root;
    for (const part of path.split("/")) {
      command.signal?.throwIfAborted();
      current = join(current, part);
      const entry = await lstat(current).catch((error: unknown) => {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "ENOENT"
        )
          return undefined;
        throw error;
      });
      invariant(
        !entry?.isSymbolicLink(),
        `Scripted commits refuse symlinks: ${path}`,
      );
    }
  }
  for (const [path, content] of Object.entries(commit.files)) {
    command.signal?.throwIfAborted();
    const target = join(root, path);
    if (content === null) {
      await unlink(target);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  const run = (args: readonly string[]) =>
    requireSuccess({
      executable: "git",
      arguments: [
        "-c",
        `core.hooksPath=${process.platform === "win32" ? "NUL" : "/dev/null"}`,
        "-c",
        "commit.gpgsign=false",
        "-c",
        "user.name=Outpost Test",
        "-c",
        "user.email=outpost@example.invalid",
        ...args,
      ],
      directory: root,
      variables: {
        GIT_LITERAL_PATHSPECS: "1",
        GIT_AUTHOR_NAME: "Outpost Test",
        GIT_AUTHOR_EMAIL: "outpost@example.invalid",
        GIT_COMMITTER_NAME: "Outpost Test",
        GIT_COMMITTER_EMAIL: "outpost@example.invalid",
      },
      ...(command.signal ? { signal: command.signal } : {}),
      ...(command.deadlineMs === undefined
        ? {}
        : { deadlineMs: command.deadlineMs }),
    });
  await run(["add", "--", ...paths]);
  await run(["commit", "--only", "-m", commit.message, "--", ...paths]);
}
