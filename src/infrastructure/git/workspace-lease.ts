import { integrateCandidate } from "./integration-candidate.ts";
import { observedOperation } from "../../domain/observed-operation.ts";
import { join } from "node:path";
import { OutpostError, recordRecovery } from "../../domain/errors.ts";
import type {
  Disposal,
  WorkspaceRecord,
} from "../../domain/workspace.types.ts";
import { inside } from "../files.ts";
import { git } from "./command.ts";
import { lock } from "./lock.ts";
import { inspectDiffGuard, verifyGuardSnapshot } from "./diff-guard.ts";
import type { GuardSnapshot } from "./diff-guard.types.ts";
import type {
  AcquireWorkspaceOptions,
  WorkspaceLease,
} from "./workspace.types.ts";

export function workspaceLease(
  record: WorkspaceRecord,
  options: AcquireWorkspaceOptions,
  unlock: () => Promise<void>,
): WorkspaceLease {
  const { policy, repository, baseBranch, branch, directory: workdir } = record;
  let disposal: Promise<Disposal> | undefined;
  let guardRefused = false;
  const guard = options.guard
    ? Object.freeze({
        ...options.guard,
        ...(options.guard.protectedPaths
          ? { protectedPaths: Object.freeze([...options.guard.protectedPaths]) }
          : {}),
      })
    : undefined;
  const checkGuard = async () => {
    if (!guard) return undefined;
    try {
      return await observedOperation(
        options.observation,
        "git",
        "diff.guard",
        () => inspectDiffGuard(record, guard, options.limits?.collectMs),
      );
    } catch (cause) {
      guardRefused = true;
      throw cause;
    }
  };
  return {
    ...record,
    checkGuard,
    retain() {
      guardRefused = true;
    },
    async integrate(candidate) {
      if (policy.mode !== "integrate") return;
      if (candidate) {
        try {
          await integrateCandidate(record, candidate, options);
        } catch (cause) {
          guardRefused = true;
          throw cause;
        }
        return;
      }
      const releaseMerge = await observedOperation(
        options.observation,
        "git",
        "integration.lock",
        async () => lock(repository, repository),
      ).catch((error: unknown) => {
        guardRefused = true;
        recordRecovery(error, { branch, directory: workdir });
        throw error;
      });
      let snapshot: GuardSnapshot | undefined;
      try {
        const current = (
          await git(repository, ["symbolic-ref", "--short", "HEAD"])
        ).trim();
        if (current !== baseBranch)
          throw new OutpostError(
            "conflict",
            "Host branch changed during the job",
            { expected: baseBranch, current, directory: workdir },
          );
        snapshot = await checkGuard();
        if (snapshot)
          await verifyGuardSnapshot(
            record,
            snapshot,
            options.limits?.collectMs,
          );
        await git(
          repository,
          ["merge", "--no-edit", snapshot?.candidateCommit ?? branch],
          options.limits?.mergeMs,
        );
      } catch (cause) {
        if (cause instanceof OutpostError && cause.code === "guard") {
          guardRefused = true;
          const error = new OutpostError(
            "guard",
            cause.message,
            {
              ...cause.details,
              ...snapshot,
              directory: workdir,
              branch,
            },
            cause.cause,
          );
          recordRecovery(error, { branch, directory: workdir });
          throw error;
        }
        guardRefused = true;
        const error = new OutpostError(
          "conflict",
          "Automatic integration failed; workspace retained",
          { directory: workdir, branch },
          cause,
        );
        recordRecovery(error, { directory: workdir, branch });
        throw error;
      } finally {
        await observedOperation(
          options.observation,
          "git",
          "integration.unlock",
          async () => releaseMerge(),
        );
      }
    },
    dispose(preserve = false) {
      if (disposal) return disposal;
      disposal = (async () => {
        try {
          if (policy.mode === "current") return {};
          if (preserve || guardRefused) return { retainedDirectory: workdir };
          const attached = await git(workdir, [
            "symbolic-ref",
            "--quiet",
            "HEAD",
          ]).catch(() => "");
          if (!attached.trim()) return { retainedDirectory: workdir };
          const dirty = await git(workdir, [
            "status",
            "--porcelain",
            "--untracked-files=normal",
            "--ignored",
          ]);
          if (dirty.trim()) return { retainedDirectory: workdir };
          if (!inside(join(repository, ".outpost", "workspaces"), workdir))
            throw new OutpostError(
              "workspace",
              "Refusing to remove an unmanaged workspace",
            );
          await git(repository, ["worktree", "remove", workdir]);
          if (policy.mode === "integrate")
            await git(repository, ["branch", "-d", branch]).catch(
              () => undefined,
            );
          return {};
        } finally {
          await observedOperation(
            options.observation,
            "git",
            "workspace.unlock",
            async () => unlock(),
          );
        }
      })();
      return disposal;
    },
  };
}
