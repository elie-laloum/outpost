import type { SpeculationOptions } from "@elie-laloum/outpost";

// One changed line costs one point; 1,000 output tokens cost one more point.
export const score: NonNullable<SpeculationOptions["score"]> = async ({
  result,
  sandbox,
  signal,
}) => {
  const diff = await sandbox.command({
    executable: "git",
    arguments: ["diff", "--numstat", sandbox.workspace.baseline, "HEAD"],
    signal,
  });
  if (diff.status !== 0)
    throw new Error(`Diff inspection failed: ${diff.stderr}`);

  let changedLines = 0;
  for (const line of diff.stdout.trim().split("\n").filter(Boolean)) {
    const counts = /^(\d+)\t(\d+)\t/.exec(line);
    if (!counts) throw new Error(`Cannot score this diff entry: ${line}`);
    changedLines += Number(counts[1]) + Number(counts[2]);
  }
  return -changedLines - result.usage.output / 1_000;
};
