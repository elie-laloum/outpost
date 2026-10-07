import type { SpeculationOptions } from "@elie-laloum/outpost";

export const validate: SpeculationOptions["validate"] = async ({
  result,
  sandbox,
  signal,
}) => {
  if (!result.completed || result.commits.length === 0) return false;
  const files = await sandbox.command({
    executable: "git",
    arguments: ["diff", "--name-only", sandbox.workspace.baseline, "HEAD"],
    signal,
  });
  if (files.status !== 0 || files.stdout.trim() !== "slug.ts") return false;

  const tests = await sandbox.command({
    executable: "node",
    arguments: ["--test", "slug.test.ts"],
    signal,
  });
  return tests.status === 0;
};
