import { git } from "./command.ts";

export async function refreshWorktree(
  repository: string,
  directory: string,
  branch: string,
  deadlineMs?: number,
): Promise<void> {
  const attached = (
    await git(directory, ["symbolic-ref", "--quiet", "--short", "HEAD"]).catch(
      () => "",
    )
  ).trim();
  const dirty = (await git(directory, ["status", "--porcelain"])).trim();
  if (attached !== branch || dirty) return;
  const remotes = (await git(repository, ["remote"])).split(/\s+/);
  if (!remotes.includes("origin")) return;
  const target = `refs/remotes/origin/${branch}`;
  const fetched = await git(
    repository,
    ["fetch", "origin", `refs/heads/${branch}:${target}`],
    deadlineMs,
  ).then(
    () => true,
    () => false,
  );
  if (!fetched) return;
  const head = (await git(directory, ["rev-parse", "HEAD"])).trim();
  const forward = await git(repository, [
    "merge-base",
    "--is-ancestor",
    head,
    target,
  ]).then(
    () => true,
    () => false,
  );
  if (forward) await git(directory, ["merge", "--ff-only", target], deadlineMs);
}
