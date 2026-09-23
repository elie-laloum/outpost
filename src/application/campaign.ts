import { invariant, positive } from "../domain/errors.ts";
import { workflow } from "../domain/workflow.ts";
import { task } from "../domain/workflow/task.ts";
import { git } from "../infrastructure/git/command.ts";
import { integrateIssues } from "./campaign-integration.ts";
import { planIssues } from "./campaign-planner.ts";
import { implementIssue } from "./campaign-worker.ts";
import { campaignDefaults } from "./campaign.constants.ts";
import type {
  CampaignContext,
  CampaignEvent,
  CampaignOptions,
  CampaignResult,
  CompletedIssue,
  IssueOutcome,
} from "./campaign.types.ts";
import { notify } from "./observation.ts";

export type {
  CampaignEvent,
  CampaignOptions,
  CampaignResult,
  IssueOutcome,
} from "./campaign.types.ts";

export async function campaign(
  options: CampaignOptions,
): Promise<CampaignResult> {
  options.signal?.throwIfAborted();
  const limit = positive(options.cycles ?? campaignDefaults.cycles, "cycles");
  const concurrency = positive(
    options.concurrency ?? campaignDefaults.concurrency,
    "concurrency",
  );
  positive(
    options.implementationPasses ?? campaignDefaults.implementationPasses,
    "implementationPasses",
  );
  positive(
    options.reviewPasses ?? campaignDefaults.reviewPasses,
    "reviewPasses",
  );
  const {
    backlog,
    planner,
    reviewer,
    merger,
    cycles: _cycles,
    concurrency: _concurrency,
    implementationPasses,
    reviewPasses,
    standards = campaignDefaults.standards,
    observe,
    ...runtime
  } = options;
  const repository = runtime.repository ?? process.cwd();
  const outcomes: IssueOutcome[] = [];
  const emit = (phase: CampaignEvent["phase"], cycle: number, issue?: string) =>
    notify(observe, { phase, cycle, ...(issue ? { issue } : {}) });
  for (let cycle = 1; cycle <= limit; cycle++) {
    runtime.signal?.throwIfAborted();
    emit("backlog", cycle);
    const available = await backlog.list(runtime.signal);
    invariant(
      new Set(available.map((issue) => issue.id)).size === available.length,
      "Backlog contains duplicate issue ids",
    );
    if (!available.length)
      return { cycles: cycle - 1, reason: "empty", issues: outcomes };
    const pending = new Set(available.map((issue) => issue.id));
    const ready = available.filter(
      (issue) => !issue.blockedBy?.some((id) => pending.has(id)),
    );
    if (!ready.length)
      return { cycles: cycle - 1, reason: "blocked", issues: outcomes };
    const context: CampaignContext = {
      options,
      runtime,
      standards,
      emit: (phase, issue) => emit(phase, cycle, issue),
    };
    const assignments = await planIssues(context, ready, concurrency);
    if (!assignments.length)
      return { cycles: cycle - 1, reason: "blocked", issues: outcomes };
    const baseline = (await git(repository, ["rev-parse", "HEAD"])).trim();
    for (const assignment of assignments) {
      invariant(
        ready.some((issue) => issue.id === assignment.id),
        `Plan selected an unavailable or blocked issue: ${assignment.id}`,
      );
      await git(repository, [
        "check-ref-format",
        "--branch",
        assignment.branch,
      ]);
      const exists = await git(repository, [
        "show-ref",
        "--verify",
        `refs/heads/${assignment.branch}`,
      ]).then(
        () => true,
        () => false,
      );
      invariant(!exists, `Issue branch already exists: ${assignment.branch}`);
    }
    const jobs = assignments.map((assignment, index) =>
      task({
        key: `issue-${index + 1}`,
        async perform({ signal }) {
          return implementIssue(context, assignment, baseline, signal);
        },
      }),
    );
    const execution = await workflow(`batch-${cycle}`, jobs).start({
      concurrency,
      stopOnError: false,
      ...(runtime.signal ? { signal: runtime.signal } : {}),
    });
    runtime.signal?.throwIfAborted();
    const completed: CompletedIssue[] = [];
    jobs.forEach((job, index) => {
      const record = execution.tasks[index]!;
      if (record.status !== "done")
        outcomes.push({
          ...assignments[index]!,
          state: "failed",
          error: record.error,
        });
      else {
        const item = execution.value(job);
        if (item) completed.push(item);
        else outcomes.push({ ...assignments[index]!, state: "empty" });
      }
    });
    if (!completed.length)
      return { cycles: cycle, reason: "no-progress", issues: outcomes };
    emit("merge", cycle);
    await integrateIssues(context, completed);
    for (const item of completed) {
      emit("close", cycle, item.id);
      await backlog.close(item.id, runtime.signal);
      outcomes.push({ id: item.id, branch: item.branch, state: "merged" });
    }
  }
  return { cycles: limit, reason: "limit", issues: outcomes };
}
