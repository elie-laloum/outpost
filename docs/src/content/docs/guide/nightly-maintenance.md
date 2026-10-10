---
title: "Schedule nightly maintenance"
description: "Schedule a maintenance workflow and resume the same run after a quota pause."
---

[Download all files](../../guide-examples/nightly-maintenance.tar.gz). Extract into a dedicated directory, run `npm install`, then adapt `outpost.config.ts` using [Installation](../setup/). The commands below identify the scripts to run.

<!-- canvas -->

- **Schedule**: Queue this night’s run at 02:00 and its continuation at 07:00, Paris weekdays.
  - Scheduler
  - → **Update**: job claimed
- **Update**: The agent updates dependencies, tests and commits accepted changes.
  - Worker
  - → **Morning report**: task completed
  - → **Quota pause**: quota reached
- **Quota pause**: Save progress; a later job resumes when permitted.
  - Worker
  - → **Update**: can resume
- **Morning report**: Read the saved report and review the retained branch.
  - You

## Schedule the nights

Both schedules give the same night the same `runId`, such as `deps-2026-09-29`. The 07:00 job resumes that run if a usage limit paused it.

<!-- tabs -->

```ts title="nightly-time.ts"
export const timeZone = "Europe/Paris";
export const runId = (slot: Date) =>
  `deps-${slot.toLocaleDateString("en-CA", { timeZone })}`;
```

```ts title="nightly-schedules.ts"
import { createCronSchedule } from "@elie-laloum/outpost";
import { timeZone, runId } from "./nightly-time.ts";

export const schedules = [
  {
    name: "nightly-deps",
    cron: createCronSchedule("0 2 * * 1-5", { timeZone }),
    handler: "nightly-deps",
    runId,
  },
  {
    name: "nightly-deps-resume",
    cron: createCronSchedule("0 7 * * 1-5", { timeZone }),
    handler: "nightly-deps",
    runId,
  },
];
```

```ts title="scheduler.ts"
import { createSqliteTaskQueue, runSchedules } from "@elie-laloum/outpost";
import { schedules } from "./nightly-schedules.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({ queue, signal: stop.signal, schedules });
} finally {
  queue.close();
}
```

## Run the workflow

Define the report, agent and update task.

The explicit schema in `report-schema.ts` describes the input JSON injected into the prompt; `nightly-report.ts` validates the returned answer.

```ts title="report-schema.ts"
export const reportSchema = {
  type: "object",
  properties: {
    updated: { type: "array", items: { type: "string" } },
    skipped: { type: "array", items: { type: "string" } },
  },
  required: ["updated", "skipped"],
};
```

Import this schema in `nightly-report.ts` so automatic instructions describe the expected answer; the existing validation function continues to check its content.

<!-- tabs -->

```ts title="nightly-report.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { reportSchema } from "./report-schema.ts";

export function names(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string"))
    throw new Error("Expected a list of strings");
  return value;
}
export const report = defineJsonResponse({
  tag: "report",
  jsonSchema: reportSchema,
  schema(input) {
    if (typeof input !== "object" || input === null)
      throw new Error("Expected an object");
    if (!("updated" in input) || !("skipped" in input))
      throw new Error("Expected updated and skipped");
    return { updated: names(input.updated), skipped: names(input.skipped) };
  },
});
```

```ts title="nightly-agent.ts"
import {
  createFallbackAgent,
  createAgent,
  createClaudeHarness,
} from "@elie-laloum/outpost";
import { coder } from "./outpost.config.ts";

export const agent = createFallbackAgent(
  [
    coder,
    createAgent({
      harness: createClaudeHarness({ authentication: "account" }),
    }),
  ],
  { on: ["quota"] },
);
```

```ts title="nightly-brief.ts"
export const brief = {
  text: [
    "Update outdated dependencies one at a time.",
    "Run the tests after each update; commit it if they pass, revert it otherwise.",
    "The branch may already hold updates from an earlier attempt: keep them.",
    'End with <report>{"updated": ["name@version"], "skipped": ["name: reason"]}</report>.',
  ].join("\n"),
};
```

```ts title="update-agent.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { agent } from "./nightly-agent.ts";
import { report } from "./nightly-report.ts";
import { brief } from "./nightly-brief.ts";

export function updateAgent(runId: string) {
  return defineIsolatedTask({
    key: "update-agent",
    request: () => ({
      repository,
      sandboxProvider,
      agent,
      branch: { mode: "named", name: `outpost/${runId}` },
      response: report,
      brief,
    }),
  });
}
```

```ts title="update-task.ts"
import { updateAgent } from "./update-agent.ts";
import { defineTask } from "@elie-laloum/outpost";

export function updateTask(runId: string) {
  const agentTask = updateAgent(runId);
  return defineTask({
    key: "update",
    perform: async (context) => {
      const { branch, commits, value } = await agentTask.perform(context);
      return {
        branch,
        commits: commits.map((commit) => commit.subject),
        report: value,
      };
    },
  });
}
```

Publish the report and process checkpointed jobs in `worker.ts`.

<!-- tabs -->

```ts title="publish-report.ts"
import { updateTask } from "./update-task.ts";
import { defineTask } from "@elie-laloum/outpost";
import { mkdir, writeFile } from "node:fs/promises";

export function publishTask(
  runId: string,
  update: ReturnType<typeof updateTask>,
) {
  return defineTask({
    key: "publish",
    after: [update],
    perform: async (context) => {
      await mkdir("reports", { recursive: true });
      const file = `reports/${runId}.json`;
      await writeFile(file, JSON.stringify(context.value(update), null, 2));
      return file;
    },
  });
}
```

```ts title="nightly-workflow.ts"
import { updateTask } from "./update-task.ts";
import { publishTask } from "./publish-report.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

export function nightly(runId: string) {
  const update = updateTask(runId);
  const publish = publishTask(runId, update);
  return defineWorkflow("nightly-deps", [update, publish]);
}
```

```ts title="nightly-job.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
  defineWorkflowJob,
} from "@elie-laloum/outpost";
import { nightly } from "./nightly-workflow.ts";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
export const job = defineWorkflowJob({
  checkpoint: { store, version: "1", resume: "retry-incomplete" },
  start: { onQuota: { action: "pause", maxWaitMs: 4 * 60 * 60_000 } },
  workflow: (_input, { runId }) => nightly(runId),
});
```

```ts title="worker.ts"
import { createSqliteTaskQueue, runQueueWorker } from "@elie-laloum/outpost";
import { job } from "./nightly-job.ts";

export const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
export const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "nightly-1",
    signal: stop.signal,
    handlers: { "nightly-deps": job },
  });
} finally {
  queue.close();
}
```

### Run the script

Run each command in its own terminal or service. Ctrl+C stops either one cleanly.

```sh
node scheduler.ts
node worker.ts
```

### Try it now

Keep the worker running and run `node enqueue-now.ts` in another terminal. It publishes one job without waiting for the night. Read its result using the printed ID, as shown in [Jobs and workers](../job-queues/).

```ts title="enqueue-now.ts"
import { randomUUID } from "node:crypto";
import { createSqliteTaskQueue } from "@elie-laloum/outpost";

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const id = `manual-${randomUUID()}`;
try {
  await queue.enqueue({
    id,
    handler: "nightly-deps",
    input: { runId: id, input: null },
  });
  console.log(id);
} finally {
  queue.close();
}
```

## Understand the steps

Claude Code can report when its limit resets; Codex never does. A run stopped by Codex alone therefore waits for the 07:00 job. With the fallback, the task pauses only when both agents hit their limit, and the reset is known only if both report one.

Finished tasks always come from the checkpoint. `resume: "retry-incomplete"` authorizes the rest to run again: a task interrupted by a worker stop, or one that failed during the night.

If you stop the worker during a run, its job returns to the queue after the 30-second lease. The restarted worker claims it and continues from the interrupted task.

## Adapt the example

### Another chore

Change the brief and the report schema: fix lint warnings, remove dead code, update a changelog. Keep one dated branch per run so each morning has its own review.

### Approve before merging

Add a [`defineApprovalTask()`](../approvals/) after `update`, then a task that merges the branch. The job completes `paused` and lists the gate in `pauses`. Submit the decision with `workflow.start()` and the `runId` and `version` from the job value.

### Use Redis

Replace `createSqliteTaskQueue()` with `createBullMQTaskQueue()` from [Redis and BullMQ](../redis-workers/) to run workers on several machines. Give each worker a unique `worker` name.

### Schedule from CI

Without a long-running scheduler, a scheduled CI job can call `nightly(runId).start()` with the same `checkpoint` and `onQuota` options. Store checkpoints in [S3 or R2](../object-storage/) and retain the worktrees and captured conversations before resuming on another runner; see [Run in CI](../ci-automation/).

## Limits

- A worker killed without a clean stop keeps ownership of the checkpoint. The next job for that run fails until you clear ownership with `recoverWorkflowCheckpoint()` ([Durable runs](../durable-runs/)).
- A resumed task continues the captured conversation of a single agent. With a fallback agent, it restarts from the first candidate and the original brief, on the same branch.
- One worker runs jobs one at a time, so the 07:00 job waits behind a run still in progress. With several workers, that job fails while the run is still executing.

API: [runSchedules](../../reference/runschedules/) · [createCronSchedule](../../reference/createcronschedule/) · [runQueueWorker](../../reference/runqueueworker/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [createFallbackAgent](../../reference/createfallbackagent/) · [defineJsonResponse](../../reference/definejsonresponse/).
