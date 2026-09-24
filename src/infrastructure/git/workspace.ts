import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { OutpostError, recordRecovery } from "../../domain/errors.ts";
import { copySelected, inside } from "../files.ts";
import { git } from "./command.ts";
import { lock } from "./lock.ts";
import { managedWorktree } from "./managed-worktree.ts";
import { prepareRepository } from "./repository.ts";
import { workspaceLease } from "./workspace-lease.ts";
import type {
  AcquireWorkspaceOptions,
  WorkspaceLease,
} from "./workspace.types.ts";

export async function acquireWorkspace(
  options: AcquireWorkspaceOptions,
): Promise<WorkspaceLease> {
  const repository = await prepareRepository(options);
  const policy = options.branch ?? { mode: "current" };
  const baseBranch = (
    await git(repository, ["symbolic-ref", "--quiet", "--short", "HEAD"]).catch(
      () => "",
    )
  ).trim();
  if (policy.mode === "integrate" && !baseBranch)
    throw new OutpostError(
      "workspace",
      "Automatic integration requires an attached host branch",
    );
  if (policy.mode === "current" && options.copies?.length)
    throw new OutpostError(
      "configuration",
      "Copied inputs require a separate workspace",
    );
  const branch =
    policy.mode === "current"
      ? baseBranch || "HEAD"
      : policy.mode === "named"
        ? policy.name
        : `outpost/${
            options.label
              ? options.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .slice(0, 48) + "-"
              : "job-"
          }${randomUUID()}`;
  if (policy.mode !== "current")
    await git(repository, ["check-ref-format", "--branch", branch]);
  const unlock = await lock(
    repository,
    policy.mode === "current" ? repository : branch,
  );
  let workdir = repository;
  let created = false;
  try {
    if (policy.mode !== "current") {
      ({ workdir, created } = await managedWorktree({
        repository,
        policy,
        branch,
        options,
      }));
    }
    await copySelected(
      repository,
      workdir,
      options.copies ?? [],
      options.limits?.copyMs,
    );
    const baseline = (await git(workdir, ["rev-parse", "HEAD"])).trim();
    const gitDir = (
      await git(workdir, ["rev-parse", "--absolute-git-dir"])
    ).trim();
    const common = (
      await git(workdir, [
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ])
    ).trim();
    return workspaceLease(
      {
        repository,
        directory: workdir,
        branch,
        baseBranch,
        baseline,
        policy,
        gitDirectories: [...new Set([gitDir, common])],
      },
      options,
      unlock,
    );
  } catch (error) {
    if (created) {
      const clean = await git(workdir, [
        "status",
        "--porcelain",
        "--ignored",
      ]).then(
        (output) => !output.trim(),
        () => false,
      );
      if (clean && inside(join(repository, ".outpost", "workspaces"), workdir))
        await git(repository, ["worktree", "remove", workdir]).catch(
          () => undefined,
        );
      else recordRecovery(error, { branch, directory: workdir });
    }
    await unlock();
    throw error;
  }
}
