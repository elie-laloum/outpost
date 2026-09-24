import { join } from "node:path";
import { OutpostError } from "../../domain/errors.ts";
import type {
  Disposal,
  WorkspaceRecord,
} from "../../domain/workspace.types.ts";
import { inside } from "../files.ts";
import { git } from "./command.ts";
import { lock } from "./lock.ts";
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
  return {
    ...record,
    async integrate() {
      if (policy.mode !== "integrate") return;
      const current = (
        await git(repository, ["symbolic-ref", "--short", "HEAD"])
      ).trim();
      if (current !== baseBranch)
        throw new OutpostError(
          "conflict",
          "Host branch changed during the job",
          { expected: baseBranch, current, directory: workdir },
        );
      const releaseMerge = await lock(repository, `merge:${baseBranch}`);
      try {
        await git(
          repository,
          ["merge", "--no-edit", branch],
          options.limits?.mergeMs,
        );
      } catch (cause) {
        throw new OutpostError(
          "conflict",
          "Automatic integration failed; workspace retained",
          { directory: workdir, branch },
          cause,
        );
      } finally {
        await releaseMerge();
      }
    },
    dispose(preserve = false) {
      if (disposal) return disposal;
      disposal = (async () => {
        try {
          if (policy.mode === "current") return {};
          if (preserve) return { retainedDirectory: workdir };
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
          await unlock();
        }
      })();
      return disposal;
    },
  };
}
