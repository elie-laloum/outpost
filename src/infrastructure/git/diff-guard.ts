import { enforceDiffGuard } from "../../domain/diff-guard.ts";
import type { DiffGuard } from "../../domain/diff-guard.types.ts";
import { OutpostError, recordRecovery } from "../../domain/errors.ts";
import type { WorkspaceRecord } from "../../domain/workspace.types.ts";
import { git } from "./command.ts";
import { collectDiffStatistics } from "./diff-statistics.ts";
import type { GuardSnapshot } from "./diff-guard.types.ts";

async function verifyReferences(
  record: WorkspaceRecord,
  snapshot: GuardSnapshot,
  deadlineMs?: number,
): Promise<void> {
  const commit = async (directory: string, ref: string) =>
    (
      await git(
        directory,
        ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`],
        deadlineMs,
      )
    ).trim();
  const attached = (
    await git(record.directory, ["symbolic-ref", "--quiet", "HEAD"], deadlineMs)
  ).trim();
  if (
    attached !== `refs/heads/${record.branch}` ||
    (await commit(record.directory, "HEAD")) !== snapshot.candidateCommit ||
    (await commit(record.repository, `refs/heads/${record.branch}`)) !==
      snapshot.candidateCommit
  )
    throw new OutpostError(
      "guard",
      "Candidate changed during diff inspection",
      { reasons: ["references-changed"] },
    );
  if (snapshot.hostCommit === undefined) return;
  const hostBranch = (
    await git(
      record.repository,
      ["symbolic-ref", "--quiet", "HEAD"],
      deadlineMs,
    )
  ).trim();
  if (
    hostBranch !== `refs/heads/${record.baseBranch}` ||
    (await commit(record.repository, "HEAD")) !== snapshot.hostCommit
  )
    throw new OutpostError("guard", "Host changed during diff inspection", {
      reasons: ["references-changed"],
    });
}

export async function verifyGuardSnapshot(
  record: WorkspaceRecord,
  snapshot: GuardSnapshot,
  deadlineMs?: number,
): Promise<void> {
  try {
    await verifyReferences(record, snapshot, deadlineMs);
  } catch (cause) {
    if (cause instanceof OutpostError && cause.code === "guard") throw cause;
    throw new OutpostError(
      "guard",
      "Cannot verify references after diff inspection",
      {
        reasons: ["inspection"],
      },
      cause,
    );
  }
}

export async function inspectDiffGuard(
  record: WorkspaceRecord,
  guard: DiffGuard,
  deadlineMs?: number,
): Promise<GuardSnapshot> {
  let snapshot: GuardSnapshot | undefined;
  try {
    const candidateCommit = (
      await git(
        record.repository,
        [
          "rev-parse",
          "--verify",
          "--end-of-options",
          `refs/heads/${record.branch}^{commit}`,
        ],
        deadlineMs,
      )
    ).trim();
    snapshot = { baseline: record.baseline, candidateCommit };
    if (record.policy.mode === "integrate") {
      const hostCommit = (
        await git(record.repository, ["rev-parse", "HEAD"], deadlineMs)
      ).trim();
      const bases = (
        await git(
          record.repository,
          ["merge-base", "--all", hostCommit, candidateCommit],
          deadlineMs,
        )
      )
        .trim()
        .split("\n");
      if (bases.length !== 1 || !bases[0])
        throw new OutpostError(
          "guard",
          "Committed diff has no unique merge base",
          { reasons: ["inspection"] },
        );
      snapshot = { baseline: bases[0], candidateCommit, hostCommit };
    }
    await verifyGuardSnapshot(record, snapshot, deadlineMs);
    const changes = await collectDiffStatistics(
      record.repository,
      snapshot.baseline,
      candidateCommit,
      deadlineMs,
    );
    enforceDiffGuard(guard, changes);
    await verifyGuardSnapshot(record, snapshot, deadlineMs);
    return snapshot;
  } catch (cause) {
    const fault =
      cause instanceof OutpostError && cause.code === "guard"
        ? cause
        : new OutpostError(
            "guard",
            "Cannot inspect committed diff; workspace retained",
            { reasons: ["inspection"] },
            cause,
          );
    const error = new OutpostError(
      "guard",
      fault.message,
      {
        ...fault.details,
        ...snapshot,
        branch: record.branch,
        directory: record.directory,
      },
      fault.cause,
    );
    recordRecovery(error, {
      branch: record.branch,
      directory: record.directory,
    });
    throw error;
  }
}
