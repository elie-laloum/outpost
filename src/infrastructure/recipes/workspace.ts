import { join, resolve } from "node:path";
import { directory, inside } from "../files.ts";
import { git } from "../git/command.ts";
import { lock } from "../git/lock.ts";
import { workspaceLease } from "../git/workspace-lease.ts";
import { validateDiffGuard } from "../../domain/diff-guard.ts";
import type { WorkspaceRecord } from "../../domain/workspace.types.ts";
import type {
  AcquireWorkspaceOptions,
  WorkspaceLease,
} from "../git/workspace.types.ts";

export async function inspectRecipeWorkspace(
  record: WorkspaceRecord,
  options: AcquireWorkspaceOptions,
): Promise<void> {
  validateDiffGuard(options.guard, record.policy);
  const repository = await directory(record.repository);
  const workdir = await directory(record.directory);
  if (
    options.repository &&
    (await directory(options.repository)) !== repository
  )
    throw new Error("Recipe workspace repository changed");
  if (record.policy.mode === "named" && record.policy.name !== record.branch)
    throw new Error("Recipe workspace named branch changed");
  const root = join(repository, ".outpost", "workspaces");
  if (
    record.policy.mode === "current"
      ? resolve(repository) !== resolve(workdir)
      : resolve(workdir) === resolve(root) || !inside(root, workdir)
  )
    throw new Error("Recipe workspace is outside its recorded repository");
  const top = (await git(workdir, ["rev-parse", "--show-toplevel"])).trim();
  const branch =
    (
      await git(workdir, ["symbolic-ref", "--quiet", "--short", "HEAD"]).catch(
        () => "",
      )
    ).trim() || "HEAD";
  if (resolve(top) !== resolve(workdir) || branch !== record.branch)
    throw new Error(
      "Recipe workspace moved or its branch changed; recover it explicitly",
    );
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
  const expected = new Set(record.gitDirectories.map((path) => resolve(path)));
  const actual = new Set([gitDir, common].map((path) => resolve(path)));
  if (
    actual.size !== expected.size ||
    [...actual].some((path) => !expected.has(path))
  )
    throw new Error(
      "Recipe workspace Git metadata changed; recover it explicitly",
    );
  await git(workdir, ["cat-file", "-e", `${record.baseline}^{commit}`]);
}

export async function restoreRecipeWorkspaceLease(
  record: WorkspaceRecord,
  options: AcquireWorkspaceOptions,
): Promise<WorkspaceLease> {
  const unlock = await lock(
    record.repository,
    record.policy.mode === "current" ? record.repository : record.branch,
  );
  try {
    await inspectRecipeWorkspace(record, options);
    return workspaceLease(record, options, unlock);
  } catch (error) {
    await unlock();
    throw error;
  }
}
