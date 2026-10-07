import { invariant, OutpostError } from "../domain/errors.ts";
import type { CommandResult } from "../domain/command.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { ConflictContext } from "./conflict-resolution.types.ts";

export async function prepareConflictMerge(
  lease: SandboxLease,
  context: ConflictContext,
  hooksPath: string,
): Promise<void> {
  const { signal } = context;

  const invoke = (args: readonly string[]) =>
    lease.invoke({
      executable: "git",
      arguments: ["-c", `core.hooksPath=${hooksPath}`, ...args],
      directory: lease.root,
      signal,
    });
  const head = conflictCommandOutput(await invoke(["rev-parse", "HEAD"]));
  invariant(
    head === context.candidateCommit,
    "Resolution workspace changed before merge preparation",
  );
  const merge = await invoke([
    "-c",
    "merge.autoStash=false",
    "-c",
    "commit.gpgSign=false",
    "merge",
    "--no-commit",
    "--no-ff",
    context.hostCommit,
  ]);
  if (
    merge.status !== 1 ||
    !conflictCommandOutput(await invoke(["ls-files", "--unmerged"]))
  )
    throw new OutpostError(
      "conflict",
      "Expected a Git conflict while preparing resolution",
      { ...merge },
    );
}

export const conflictCommandOutput = (result: CommandResult) => {
  if (result.status !== 0)
    throw new OutpostError(
      "process",
      "Conflict resolution Git command failed",
      { ...result },
    );
  return result.stdout.trim();
};
