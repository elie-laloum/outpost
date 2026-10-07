import { OutpostError } from "../domain/errors.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import type { Command } from "../domain/command.types.ts";
import type { Sandbox } from "./outpost.types.ts";
import type {
  ConflictContext,
  ConflictResolution,
} from "./conflict-resolution.types.ts";
import { conflictResolutionDefaults } from "./conflict-resolution.constants.ts";
import { conflictCommandOutput } from "./conflict-merge.ts";

export async function verifyConflictResolution(
  sandbox: Sandbox,
  context: ConflictContext,
  command: Command,
  hooksPath: string,
): Promise<Pick<ConflictResolution, "commit" | "verification">> {
  const { signal, observation } = context;
  const run = async (args: readonly string[]) =>
    conflictCommandOutput(
      await sandbox.command({
        executable: "git",
        arguments: ["-c", `core.hooksPath=${hooksPath}`, ...args],
        signal,
      }),
    );
  const commit = await run(["rev-parse", "HEAD"]);
  const check = async () => {
    if (await run(["ls-files", "--unmerged"]))
      throw new OutpostError("conflict", "Agent left unresolved merge entries");
    if (
      await run([
        "status",
        "--porcelain",
        "--untracked-files=all",
        "--",
        ".",
        ":(exclude).outpost",
      ])
    )
      throw new OutpostError("conflict", "Resolution has uncommitted changes");
    if ((await run(["rev-parse", "HEAD"])) !== commit)
      throw new OutpostError(
        "conflict",
        "Verification changed the resolution commit",
      );
    for (const parent of [context.hostCommit, context.candidateCommit])
      await run(["merge-base", "--is-ancestor", parent, commit]);
  };
  await check();
  const verification = await observedOperation(
    observation,
    "git",
    "integration.verify",
    () =>
      sandbox.command({
        ...command,
        directory: sandbox.root,
        deadlineMs: command.deadlineMs ?? conflictResolutionDefaults.verifyMs,
        signal: command.signal
          ? AbortSignal.any([signal, command.signal])
          : signal,
      }),
  );
  if (verification.status !== 0)
    throw new OutpostError(
      "process",
      "Conflict resolution verification failed",
      { verification, commit },
    );
  await check();
  signal.throwIfAborted();
  return { commit, verification };
}
