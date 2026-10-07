import { OutpostError, recordRecovery } from "../../domain/errors.ts";
import { observedOperation } from "../../domain/observed-operation.ts";
import type { WorkspaceRecord } from "../../domain/workspace.types.ts";
import { git } from "./command.ts";
import { inspectDiffGuard, verifyGuardSnapshot } from "./diff-guard.ts";
import { lock } from "./lock.ts";
import { verificationGit } from "./verification-command.ts";
import type {
  AcquireWorkspaceOptions,
  IntegrationCandidate,
} from "./workspace.types.ts";

export async function integrateCandidate(
  source: WorkspaceRecord,
  candidate: IntegrationCandidate,
  options: AcquireWorkspaceOptions,
): Promise<void> {
  const { record, signal, commit } = candidate;
  const run = (directory: string, args: readonly string[]) =>
    verificationGit(directory, args, options.limits?.mergeMs, signal);
  const fail = (message: string) => {
    throw new OutpostError("conflict", message, {
      branch: record.branch,
      directory: record.directory,
    });
  };
  const check = async () => {
    signal.throwIfAborted();
    if (
      (
        await run(source.repository, ["symbolic-ref", "--short", "HEAD"])
      ).trim() !== source.baseBranch
    )
      fail("Host branch changed during conflict resolution");
    if (
      (await run(source.repository, ["rev-parse", "HEAD"])).trim() !==
      candidate.hostCommit
    )
      fail("Host commit changed during conflict resolution");
    if (
      (
        await run(source.repository, [
          "rev-parse",
          `refs/heads/${source.branch}`,
        ])
      ).trim() !== candidate.sourceCommit
    )
      fail("Source branch changed during conflict resolution");
    if (
      (
        await run(source.repository, [
          "status",
          "--porcelain",
          "--untracked-files=all",
          "--",
          ".",
          ":(exclude).outpost",
        ])
      ).trim()
    )
      fail("Host checkout has uncommitted changes");
    if (
      (
        await run(record.directory, ["symbolic-ref", "--short", "HEAD"])
      ).trim() !== record.branch ||
      (await run(record.directory, ["rev-parse", "HEAD"])).trim() !== commit
    )
      fail("Resolution commit changed after verification");
    if (
      (
        await run(record.directory, [
          "status",
          "--porcelain",
          "--untracked-files=all",
          "--",
          ".",
          ":(exclude).outpost",
        ])
      ).trim()
    )
      fail("Resolution has uncommitted changes");
    for (const parent of candidate.mode === "resolved"
      ? [candidate.hostCommit, candidate.sourceCommit]
      : [candidate.sourceCommit])
      await run(record.directory, [
        "merge-base",
        "--is-ancestor",
        parent,
        commit,
      ]);
  };
  const release = await observedOperation(
    options.observation,
    "git",
    "integration.lock",
    () => lock(source.repository, `merge:${source.baseBranch}`),
  );
  try {
    await check();
    const guard = options.guard;
    if (guard) {
      const inspected = await observedOperation(
        options.observation,
        "git",
        "diff.guard",
        () =>
          inspectDiffGuard(
            { ...record, policy: source.policy, baseBranch: source.baseBranch },
            guard,
            options.limits?.collectMs,
          ),
      );
      if (inspected.candidateCommit !== commit)
        fail("Resolution changed during diff inspection");
      await verifyGuardSnapshot(
        { ...record, policy: source.policy, baseBranch: source.baseBranch },
        inspected,
        options.limits?.collectMs,
      );
    }
    await check();
    await git(
      source.repository,
      [
        "merge",
        ...(candidate.mode === "resolved" ? ["--ff-only"] : []),
        "--no-edit",
        commit,
      ],
      options.limits?.mergeMs,
    );
  } catch (cause) {
    const error =
      cause instanceof OutpostError || signal.aborted
        ? cause
        : new OutpostError(
            "conflict",
            "Verified integration failed; workspaces retained",
            { branch: record.branch, directory: record.directory },
            cause,
          );
    recordRecovery(error, {
      branch: record.branch,
      directory: record.directory,
    });
    throw error;
  } finally {
    await observedOperation(
      options.observation,
      "git",
      "integration.unlock",
      () => release(),
    );
  }
}
