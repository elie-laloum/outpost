import type { Assignment, Issue } from "../domain/backlog.types.ts";
import { invariant } from "../domain/errors.ts";
import { git } from "../infrastructure/git/command.ts";
import { campaignDefaults } from "./campaign.constants.ts";
import type { CampaignContext, CompletedIssue } from "./campaign.types.ts";
import { createSandbox } from "./sandbox.ts";

export async function implementIssue(
  context: CampaignContext,
  assignment: Assignment,
  baseline: string,
  signal: AbortSignal,
): Promise<CompletedIssue | undefined> {
  const {
    runtime,
    standards,
    emit,
    options: { backlog, reviewer, implementationPasses, reviewPasses },
  } = context;
  const issue: Issue = await backlog.get(assignment.id, signal);
  invariant(issue.id === assignment.id, "Tracker returned a different issue");
  const sandbox = await createSandbox({
    ...runtime,
    signal,
    branch: { mode: "named", name: assignment.branch, from: baseline },
  });
  let success = false;
  try {
    emit("implement", issue.id);
    const implemented = await sandbox.dispatch({
      agent: runtime.agent,
      signal,
      passes: implementationPasses ?? campaignDefaults.implementationPasses,
      brief: {
        text: `Implement issue ${issue.id}: ${issue.title}\n${issue.body ?? ""}\n${standards}\nDo not close the issue. When complete, write <outpost>done</outpost>.`,
      },
    });
    if (!implemented.commits.length) {
      success = true;
      return undefined;
    }
    if (reviewer !== false) {
      emit("review", issue.id);
      await sandbox.dispatch({
        agent: reviewer ?? runtime.agent,
        signal,
        passes: reviewPasses ?? campaignDefaults.reviewPasses,
        brief: {
          text: `Review issue ${issue.id} on ${assignment.branch}. Inspect git diff ${baseline}...HEAD, fix concrete defects, run the relevant tests and commit corrections.\n${standards}\nDo not close the issue. When complete, write <outpost>done</outpost>.`,
        },
      });
    }
    const clean = await sandbox.command({
      executable: "git",
      arguments: ["status", "--porcelain"],
      signal,
    });
    invariant(
      clean.status === 0 && !clean.stdout.trim(),
      `Issue ${issue.id} has uncommitted changes`,
    );
    const head = (
      await git(sandbox.workspace.directory, ["rev-parse", "HEAD"])
    ).trim();
    success = true;
    return { ...assignment, head };
  } finally {
    await sandbox.close({ preserve: !success });
  }
}
