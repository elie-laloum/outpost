import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { directory } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { digest } from "./workspace-fingerprint.ts";

export async function repositoryFingerprint(
  repository: string,
): Promise<string> {
  const requested = await directory(repository);
  const root = await directory(
    (await git(requested, ["rev-parse", "--show-toplevel"])).trim(),
  );
  const scratch = await mkdtemp(join(tmpdir(), "outpost-fingerprint-"));
  try {
    return await digest(root, scratch);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}
