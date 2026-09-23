import { invariant, OutpostError } from "../domain/errors.ts";
import type { CampaignContext, CompletedIssue } from "./campaign.types.ts";
import { createSandbox } from "./sandbox.ts";

export async function integrateIssues(
  context: CampaignContext,
  completed: readonly CompletedIssue[],
): Promise<void> {
  const {
    runtime,
    standards,
    options: { merger },
  } = context;
  const integration = await createSandbox({
    ...runtime,
    agent: merger ?? runtime.agent,
    branch: { mode: "integrate" },
  });
  let integrated = false;
  try {
    for (const item of completed) {
      const merged = await integration.command({
        executable: "git",
        arguments: ["merge", "--no-edit", item.head],
        ...(runtime.signal ? { signal: runtime.signal } : {}),
      });
      await integration.dispatch({
        agent: merger ?? runtime.agent,
        ...(runtime.signal ? { signal: runtime.signal } : {}),
        brief: {
          text: `Validate integration of issue ${item.id} from commit ${item.head}. ${merged.status ? "Resolve the current Git merge conflict and finish the merge." : "The commits have been merged."} Run relevant tests, fix integration defects and commit any changes. ${standards} Do not close issues. When complete, write <outpost>done</outpost>.`,
        },
      });
      const verified = await integration.command({
        executable: "git",
        arguments: ["merge-base", "--is-ancestor", item.head, "HEAD"],
      });
      if (verified.status)
        throw new OutpostError(
          "conflict",
          "Merge did not include the issue commits",
          { issue: item.id, branch: item.branch },
        );
    }
    const clean = await integration.command({
      executable: "git",
      arguments: ["status", "--porcelain"],
    });
    invariant(
      clean.status === 0 && !clean.stdout.trim(),
      "Integration has uncommitted changes",
    );
    await integration.workspace.integrate();
    integrated = true;
  } finally {
    await integration.close({ preserve: !integrated });
  }
}
