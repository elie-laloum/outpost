import { randomUUID } from "node:crypto";
import type { AgentAdapter } from "../domain/ports.ts";
import type { Assignment, Backlog, Issue } from "../domain/backlog.ts";
import { readPlan } from "../domain/backlog.ts";
import { invariant, OutpostError, positive } from "../domain/errors.ts";
import { response } from "../domain/response.ts";
import { task, workflow } from "../domain/workflow.ts";
import { git } from "../infrastructure/git.ts";
import { notify } from "./execution.ts";
import { createSandbox, dispatch, type SandboxOptions } from "./outpost.ts";

export interface CampaignEvent {
  readonly phase:
    "backlog" | "plan" | "implement" | "review" | "merge" | "close";
  readonly cycle: number;
  readonly issue?: string;
}

export interface CampaignOptions extends Omit<
  SandboxOptions,
  "workspace" | "branch" | "agent"
> {
  readonly agent: AgentAdapter;
  readonly backlog: Backlog;
  readonly planner?: AgentAdapter | false;
  readonly reviewer?: AgentAdapter | false;
  readonly merger?: AgentAdapter;
  readonly cycles?: number;
  readonly concurrency?: number;
  readonly implementationPasses?: number;
  readonly reviewPasses?: number;
  readonly standards?: string;
  readonly observe?: (event: CampaignEvent) => void;
}

export interface IssueOutcome {
  readonly id: string;
  readonly branch: string;
  readonly state: "empty" | "failed" | "merged";
  readonly error?: unknown;
}

export interface CampaignResult {
  readonly cycles: number;
  readonly reason: "empty" | "blocked" | "no-progress" | "limit";
  readonly issues: readonly IssueOutcome[];
}

export async function campaign(
  options: CampaignOptions,
): Promise<CampaignResult> {
  options.signal?.throwIfAborted();
  const limit = positive(options.cycles ?? 10, "cycles");
  const concurrency = positive(options.concurrency ?? 3, "concurrency");
  positive(options.implementationPasses ?? 100, "implementationPasses");
  positive(options.reviewPasses ?? 1, "reviewPasses");
  const {
    backlog,
    planner,
    reviewer,
    merger,
    cycles: _cycles,
    concurrency: _concurrency,
    implementationPasses,
    reviewPasses,
    standards = "Follow the repository conventions. Keep changes focused, test behavior and commit the result.",
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
    const prefix = `outpost/batch-${randomUUID().slice(0, 8)}`;
    let assignments: readonly Assignment[];
    if (planner !== false) {
      emit("plan", cycle);
      const plan = await dispatch({
        ...runtime,
        agent: planner ?? runtime.agent,
        branch: { mode: "named", name: `${prefix}-planning` },
        brief: {
          text: `Select independent, unblocked issues from this backlog. Read the repository without editing files. Return <assignments>{"issues":[{"id":"an existing id","branch":"${prefix}-short-name"}]}</assignments>. Return an empty array when blocked.\n${JSON.stringify(ready)}`,
        },
        response: response.json({
          tag: "assignments",
          schema: readPlan,
          repairs: 1,
        }),
      });
      invariant(
        !plan.commits.length && !plan.retainedDirectory,
        "Planner changed its workspace; inspect the planning branch before continuing",
      );
      assignments = plan.value;
    } else
      assignments = ready.slice(0, concurrency).map((issue, index) => ({
        id: issue.id,
        branch: `${prefix}-${index + 1}`,
      }));
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
          const issue: Issue = await backlog.get(assignment.id, signal);
          invariant(
            issue.id === assignment.id,
            "Tracker returned a different issue",
          );
          const sandbox = await createSandbox({
            ...runtime,
            signal,
            branch: { mode: "named", name: assignment.branch, from: baseline },
          });
          let success = false;
          try {
            emit("implement", cycle, issue.id);
            const implemented = await sandbox.dispatch({
              agent: runtime.agent,
              signal,
              passes: implementationPasses ?? 100,
              brief: {
                text: `Implement issue ${issue.id}: ${issue.title}\n${issue.body ?? ""}\n${standards}\nDo not close the issue. When complete, write <outpost>done</outpost>.`,
              },
            });
            if (!implemented.commits.length) {
              success = true;
              return undefined;
            }
            if (reviewer !== false) {
              emit("review", cycle, issue.id);
              await sandbox.dispatch({
                agent: reviewer ?? runtime.agent,
                signal,
                passes: reviewPasses ?? 1,
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
        },
      }),
    );
    const execution = await workflow(`batch-${cycle}`, jobs).start({
      concurrency,
      stopOnError: false,
      ...(runtime.signal ? { signal: runtime.signal } : {}),
    });
    runtime.signal?.throwIfAborted();
    const completed: (Assignment & { head: string })[] = [];
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
    for (const item of completed) {
      emit("close", cycle, item.id);
      await backlog.close(item.id, runtime.signal);
      outcomes.push({ id: item.id, branch: item.branch, state: "merged" });
    }
  }
  return { cycles: limit, reason: "limit", issues: outcomes };
}
