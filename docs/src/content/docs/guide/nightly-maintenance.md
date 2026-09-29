---
title: "Nightly maintenance"
description: "Every weekday night, an agent updates dependencies on a dated branch. The run survives worker restarts and usage limits, and leaves a branch and a typed report for the morning."
---

## What you use

<!-- features -->

- [Cron schedules](../cron-schedules/): Publish one job per night, in your time zone.
  - `runSchedules()`
  - `createCronSchedule()`
- [Job queues and workers](../job-queues/): Run each job in a separate worker process.
  - `runQueueWorker()`
  - `defineWorkflowJob()`
- [Durable runs](../durable-runs/): Save each finished task in a checkpoint.
  - `createWorkflowCheckpointStore()`
- [Quota pauses](../quota-pauses/): Pause on a usage limit instead of failing.
  - `onQuota`
- [Fallback agents](../fallback-agents/): Hand the work to a second agent at the limit.
  - `createFallbackAgent()`
- [Typed responses](../typed-responses/): Validate the agent’s final report.
  - `defineJsonResponse()`

Two processes share the queue `.outpost/jobs.sqlite`: the scheduler publishes jobs, the worker runs them. Save both files next to the `outpost.config.mts` from [Setup](../setup/).

## Schedule the nights

```ts title="scheduler.mts"
import {
  createCronSchedule,
  createSqliteTaskQueue,
  runSchedules,
} from "@elie-laloum/outpost";

const timeZone = "Europe/Paris";
// en-CA formats the local date as YYYY-MM-DD.
const runId = (slot: Date) =>
  `deps-${slot.toLocaleDateString("en-CA", { timeZone })}`;

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runSchedules({
    queue,
    signal: stop.signal,
    schedules: [
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
    ],
  });
} finally {
  queue.close();
}
```

Both schedules give the same night the same `runId`, such as `deps-2026-09-29`. The 07:00 job resumes that run if a usage limit paused it.

## Run the workflow

```ts title="worker.mts"
import { mkdir, writeFile } from "node:fs/promises";
import {
  createAgent,
  createClaudeHarness,
  createFallbackAgent,
  createLocalTransport,
  createSqliteTaskQueue,
  createWorkflowCheckpointStore,
  defineIsolatedTask,
  defineJsonResponse,
  defineTask,
  defineWorkflow,
  defineWorkflowJob,
  runQueueWorker,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

function names(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string"))
    throw new Error("Expected a list of strings");
  return value;
}
const report = defineJsonResponse({
  tag: "report",
  schema(input) {
    if (typeof input !== "object" || input === null)
      throw new Error("Expected an object");
    if (!("updated" in input) || !("skipped" in input))
      throw new Error("Expected updated and skipped");
    return { updated: names(input.updated), skipped: names(input.skipped) };
  },
});

// Optional: Claude Code takes over when Codex hits its limit.
const agent = createFallbackAgent(
  [
    coder,
    createAgent({
      harness: createClaudeHarness({ authentication: "account" }),
    }),
  ],
  { on: ["quota"] },
);

function nightly(runId: string) {
  const agentTask = defineIsolatedTask({
    key: "update-agent",
    request: () => ({
      repository,
      sandboxProvider,
      agent,
      branch: { mode: "named", name: `outpost/${runId}` },
      response: report,
      brief: {
        text: [
          "Update outdated dependencies one at a time.",
          "Run the tests after each update; commit it if they pass, revert it otherwise.",
          "The branch may already hold updates from an earlier attempt: keep them.",
          'End with <report>{"updated": ["name@version"], "skipped": ["name: reason"]}</report>.',
        ].join("\n"),
      },
    }),
  });
  const update = defineTask({
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
  const publish = defineTask({
    key: "publish",
    after: [update],
    perform: async (context) => {
      await mkdir("reports", { recursive: true });
      const file = `reports/${runId}.json`;
      await writeFile(file, JSON.stringify(context.value(update), null, 2));
      return file;
    },
  });
  return defineWorkflow("nightly-deps", [update, publish]);
}

const queue = await createSqliteTaskQueue(".outpost/jobs.sqlite");
const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
const stop = new AbortController();
process.once("SIGINT", () => stop.abort());
try {
  await runQueueWorker({
    queue,
    worker: "nightly-1",
    signal: stop.signal,
    handlers: {
      "nightly-deps": defineWorkflowJob({
        checkpoint: { store, version: "1", resume: "retry-incomplete" },
        start: { onQuota: { action: "pause", maxWaitMs: 4 * 60 * 60_000 } },
        workflow: (_input, { runId }) => nightly(runId),
      }),
    },
  });
} finally {
  queue.close();
}
```

```sh
node scheduler.mts
node worker.mts
```

Run each command in its own terminal or service. Ctrl+C stops either one cleanly.

## How it works

<!-- flow -->

1. **Night**: At 02:00 Paris time, Monday to Friday.
   - **Publish**: The scheduler publishes the job `schedule:nightly-deps:<slot>`.
     - `runSchedules()`
   - **Claim**: The worker starts the workflow under the checkpoint `deps-<date>`.
     - `defineWorkflowJob()`
   - **Update**: The agent commits on `outpost/deps-<date>` and returns its report.
     - `update`
     - sandbox
   - **Write the report**: `publish` saves the branch, commits and report to `reports/deps-<date>.json`.
     - `publish`
     - host
2. **Usage limit**: The task stops without using a retry.
   - **Hand over**: Claude Code starts from the original brief on the same branch.
     - `createFallbackAgent()`
   - **Wait**: A reset within `maxWaitMs` keeps the worker waiting, then the task runs again.
     - `maxWaitMs`
   - **Pause**: A later or unknown reset pauses the task; the job completes with status `paused`.
     - `onQuota`
3. **Morning**: At 07:00, the same `runId` again.
   - **Resume**: A paused task runs again unless its reset is still beyond `maxWaitMs`.
     - `nightly-deps-resume`
   - **Review**: You read the branch and its report file.
     - host

Claude Code can report when its limit resets; Codex never does. A run stopped by Codex alone therefore waits for the 07:00 job. With the fallback, the task pauses only when both agents hit their limit, and the reset is known only if both report one.

Finished tasks always come from the checkpoint. `resume: "retry-incomplete"` authorizes the rest to run again: a task interrupted by a worker stop, or one that failed during the night.

If you stop the worker during a run, its job returns to the queue after the 30-second lease. The restarted worker claims it and continues from the interrupted task.

## Adapt it

### Another chore

Change the brief and the report schema: fix lint warnings, remove dead code, update a changelog. Keep one dated branch per run so each morning has its own review.

### Approve before merging

Add a [`defineApprovalTask()`](../approvals/) after `update`, then a task that merges the branch. The job completes `paused` and lists the gate in `pauses`. Submit the decision with `workflow.start()` and the `runId` and `version` from the job value.

### Use Redis

Replace `createSqliteTaskQueue()` with `createBullMQTaskQueue()` from [Redis and BullMQ](../redis-workers/) to run workers on several machines. Give each worker a unique `worker` name.

### Schedule from CI

Without a long-running scheduler, a scheduled CI job can call `nightly(runId).start()` with the same `checkpoint` and `onQuota` options. Store checkpoints in [S3 or R2](../object-storage/) so the next CI run resumes a paused one; see [Run in CI](../ci-automation/).

## Limits

- A worker killed without a clean stop keeps ownership of the checkpoint. The next job for that run fails until you clear ownership with `recoverWorkflowCheckpoint()` ([Durable runs](../durable-runs/)).
- A resumed task continues the captured conversation of a single agent. With a fallback agent, it restarts from the first candidate and the original brief, on the same branch.
- One worker runs jobs one at a time, so the 07:00 job waits behind a run still in progress. With several workers, that job fails while the run is still executing.

API: [runSchedules](../../reference/runschedules/) · [createCronSchedule](../../reference/createcronschedule/) · [runQueueWorker](../../reference/runqueueworker/) · [defineWorkflowJob](../../reference/defineworkflowjob/) · [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [createFallbackAgent](../../reference/createfallbackagent/) · [defineJsonResponse](../../reference/definejsonresponse/).
