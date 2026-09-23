import { randomUUID } from "node:crypto";
import { readPlan } from "../domain/backlog.ts";
import type { Assignment, Issue } from "../domain/backlog.types.ts";
import { invariant } from "../domain/errors.ts";
import { response } from "../domain/response.ts";
import type { CampaignContext } from "./campaign.types.ts";
import { dispatch } from "./dispatch.ts";

export async function planIssues(
  context: CampaignContext,
  ready: readonly Issue[],
  concurrency: number,
): Promise<readonly Assignment[]> {
  const {
    runtime,
    emit,
    options: { planner },
  } = context;
  const prefix = `outpost/batch-${randomUUID().slice(0, 8)}`;
  let assignments: readonly Assignment[];
  if (planner !== false) {
    emit("plan");
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

  return assignments;
}
