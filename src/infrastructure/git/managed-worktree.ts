import { createHash, randomUUID } from "node:crypto";
import { mkdir, rename, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { OutpostError } from "../../domain/errors.ts";
import { directory, inside } from "../files.ts";
import { executeProcess } from "../process.ts";
import { git } from "./command.ts";
import { refreshWorktree } from "./refresh-worktree.ts";
import type {
  ManagedWorktree,
  ManagedWorktreeOptions,
} from "./workspace.types.ts";

export async function managedWorktree(
  context: ManagedWorktreeOptions,
): Promise<ManagedWorktree> {
  const { repository, policy, branch, options } = context;
  let workdir = repository,
    created = false;
  const hash = createHash("sha256").update(branch).digest("hex").slice(0, 12);
  const label = options.label
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 48);
  const managed = join(repository, ".outpost", "workspaces");
  const expected = join(managed, `${label ? label + "-" : ""}${hash}`);
  await git(repository, ["worktree", "prune", "--expire", "now"]);
  const list = await git(repository, ["worktree", "list", "--porcelain", "-z"]);
  const entries = list.split("\0\0").map((item) => item.split("\0"));
  const existing = entries.find(
    (fields) =>
      fields.includes(`branch refs/heads/${branch}`) ||
      (fields.includes("detached") &&
        fields.some(
          (field) =>
            field.startsWith("worktree ") &&
            inside(managed, field.slice(9)) &&
            (basename(field.slice(9)) === hash ||
              basename(field.slice(9)).endsWith("-" + hash)),
        )),
  );
  if (existing) {
    workdir = existing.find((field) => field.startsWith("worktree "))!.slice(9);
    if (!inside(managed, workdir) || resolve(workdir) === resolve(managed))
      throw new OutpostError(
        "conflict",
        `Branch ${branch} is checked out elsewhere`,
        { path: workdir },
      );
    workdir = await directory(workdir);
    await refreshWorktree(repository, workdir, branch, options.limits?.gitMs);
    return { workdir, created: false };
  }
  {
    if (
      await stat(expected).catch((error) => {
        if ((error as NodeJS.ErrnoException).code === "ENOENT")
          return undefined;
        throw error;
      })
    ) {
      const managed = join(repository, ".outpost", "workspaces");
      if (!inside(managed, expected) || resolve(expected) === resolve(managed))
        throw new OutpostError(
          "workspace",
          "Refusing to relocate an unmanaged directory",
        );
      const recovery = join(
        repository,
        ".outpost",
        "recovery",
        `orphan-${hash}-${randomUUID()}`,
      );
      await mkdir(dirname(recovery), { recursive: true });
      await rename(expected, recovery);
    }
    await mkdir(join(repository, ".outpost", "workspaces"), {
      recursive: true,
    });
    const branchExists = await executeProcess({
      executable: "git",
      arguments: ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`],
      directory: repository,
    });
    const from = policy.from ?? "HEAD";
    const oid = (
      await git(repository, [
        "rev-parse",
        "--verify",
        "--end-of-options",
        `${from}^{commit}`,
      ])
    ).trim();
    await git(
      repository,
      [
        "-c",
        "branch.autoSetupMerge=false",
        "worktree",
        "add",
        ...(branchExists.status === 0 ? [] : ["-b", branch]),
        expected,
        branchExists.status === 0 ? branch : oid,
      ],
      options.limits?.gitMs,
    );
    workdir = expected;
    created = true;
  }
  return { workdir, created };
}
