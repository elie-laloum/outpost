import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git } from "../infrastructure/git/command.ts";
import { digest } from "./workspace-fingerprint.ts";
import type { SpeculativeHostSnapshot } from "./speculation.types.ts";

export async function speculativeHostSnapshot(
  repository: string,
): Promise<SpeculativeHostSnapshot> {
  const temporary = await mkdtemp(join(tmpdir(), "outpost-speculation-"));
  try {
    const head = (
      await git(repository, ["rev-parse", "--verify", "HEAD^{commit}"])
    ).trim();
    const branch = (
      await git(repository, ["rev-parse", "--abbrev-ref", "HEAD"])
    ).trim();
    const status = await git(repository, [
      "status",
      "--porcelain",
      "--untracked-files=all",
      "--",
      ".",
      ":(exclude).outpost",
    ]);
    return {
      head,
      branch,
      dirty: !!status.trim(),
      fingerprint: await digest(repository, temporary),
    };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
