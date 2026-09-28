import { speculationIntegrationLimits } from "./speculation-integration.constants.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { git } from "../infrastructure/git/command.ts";
import { speculativeHostSnapshot } from "./speculation-host.ts";
import type { SpeculationIntegration } from "./speculation.types.ts";

export async function checkSpeculationIntegration(
  repository: string,
  branch: string,
  expectedCommit?: string,
): Promise<SpeculationIntegration> {
  const host = await speculativeHostSnapshot(repository);
  const blocked = (reason: string): SpeculationIntegration => ({
    status: "blocked",
    host,
    conflicts: [],
    reason,
  });
  if (host.dirty) return blocked("Host has uncommitted changes");
  if (host.branch === "HEAD") return blocked("Host HEAD is detached");
  try {
    const candidateCommit = (
      await git(repository, ["rev-parse", "--verify", `${branch}^{commit}`])
    ).trim();
    if (expectedCommit && candidateCommit !== expectedCommit)
      return blocked("Candidate branch changed since validation");
    const result = await executeProcess({
      executable: "git",
      arguments: [
        "-c",
        `core.hooksPath=${process.platform === "win32" ? "NUL" : "/dev/null"}`,
        "merge-tree",
        "--write-tree",
        "--name-only",
        "-z",
        host.head,
        candidateCommit,
      ],
      directory: repository,
      deadlineMs: speculationIntegrationLimits.deadlineMs,
      retain: speculationIntegrationLimits.retainBytes,
      variables: { LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" },
    });
    if (result.status !== 0 && result.status !== 1)
      return blocked("Git merge-tree preflight failed: " + result.stderr);
    if (result.stdout.length >= speculationIntegrationLimits.retainBytes)
      return blocked("Git merge-tree output exceeded its limit");
    const conflicts =
      result.status === 1
        ? result.stdout
            .split("\0")
            .slice(1)
            .filter((_, index, entries) => index < entries.indexOf(""))
        : [];
    const after = await speculativeHostSnapshot(repository);
    const currentCandidate = (
      await git(repository, ["rev-parse", "--verify", `${branch}^{commit}`])
    ).trim();
    if (
      after.fingerprint !== host.fingerprint ||
      after.branch !== host.branch ||
      currentCandidate !== candidateCommit
    )
      return blocked("Repository changed during integration preflight");
    return {
      status: result.status === 0 ? "clean" : "conflict",
      host,
      candidateCommit,
      conflicts,
    };
  } catch (error) {
    return blocked(String(error));
  }
}
