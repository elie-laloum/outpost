import { executeProcess } from "../../src/infrastructure/process.ts";
import type { CompatibilitySource } from "./cloud-compatibility.types.ts";

export async function cloudCompatibilitySource(
  directory: string,
): Promise<CompatibilitySource> {
  try {
    const revision = await executeProcess({
      executable: "git",
      arguments: ["rev-parse", "--verify", "HEAD"],
      directory,
      deadlineMs: 5_000,
    });
    const commit = revision.stdout.trim();
    if (
      revision.status !== 0 ||
      !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit)
    )
      return { commit: null, dirty: null };
    const status = await executeProcess({
      executable: "git",
      arguments: ["status", "--porcelain", "--untracked-files=normal"],
      directory,
      deadlineMs: 5_000,
    });
    return {
      commit,
      dirty: status.status === 0 ? status.stdout.length > 0 : null,
    };
  } catch {
    return { commit: null, dirty: null };
  }
}
