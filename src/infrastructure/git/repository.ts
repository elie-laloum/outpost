import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { directory } from "../files.ts";
import { git } from "./command.ts";
import { runtimeExclusions } from "./git.constants.ts";
import type { AcquireWorkspaceOptions } from "./workspace.types.ts";

export async function prepareRepository(
  options: AcquireWorkspaceOptions,
): Promise<string> {
  const requested = await directory(options.repository);
  const root = (
    await git(
      requested,
      ["rev-parse", "--show-toplevel"],
      options.limits?.gitMs,
    )
  ).trim();
  const repository = await directory(root);
  const exclude = (
    await git(repository, [
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "info/exclude",
    ])
  ).trim();
  const exclusions = await readFile(exclude, "utf8").catch(() => "");
  const patterns = runtimeExclusions;
  const missing = patterns.filter(
    (pattern) => !exclusions.split(/\r?\n/).includes(pattern),
  );
  if (missing.length) {
    await mkdir(dirname(exclude), { recursive: true });
    await appendFile(exclude, `\n${missing.join("\n")}\n`);
  }

  return repository;
}
