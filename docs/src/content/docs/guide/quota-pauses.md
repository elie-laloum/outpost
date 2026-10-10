---
title: "Pause when a quota is reached"
description: "Save a workflow after a terminal quota error and resume when access is available."
---

First configure a [durable run](../durable-runs/). Use a quota pause when a later attempt should continue after access becomes available again; use a [fallback agent](../fallback-agents/) when another explicitly configured agent should take over now.

## Pause instead of failing

Set `onQuota` on the workflow’s `start()` method when you want to preserve progress after a terminal quota error. With a checkpoint configured, the affected task pauses so it can resume later.

<!-- tabs -->

```ts title="quota-review.ts"
import { defineTask, OutpostError } from "@elie-laloum/outpost";

export let calls = 0;
export const review = defineTask({
  key: "review",
  perform: () => {
    if (++calls === 1)
      throw new OutpostError("quota", "You've hit your session limit", {
        resetAt: new Date(Date.now() + 1_000).toISOString(),
      });
    return "reviewed";
  },
});
export function reviewCount() {
  return calls;
}
```

```ts title="quota-checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: ".outpost/storage" }),
  }),
  runId: "nightly-2026-09-28",
  version: "1",
};
```

```ts title="resume.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./quota-review.ts";
import { checkpoint } from "./quota-checkpoint.ts";

export const result = await defineWorkflow("nightly", [review]).start({
  checkpoint,
  onQuota: { action: "pause", maxWaitMs: 6 * 60 * 60_000 },
});
result.unwrap();
console.log(result.value(review));
// Example output: reviewed
```

<!-- check:run -->

It prints `reviewed`: the simulated limit resets after one second, within `maxWaitMs`, so the workflow waits and runs the task again.

`onQuota` needs a [checkpoint](../durable-runs/) to hold the pause. With the default `maxWaitMs` of `0`, nothing waits in the process: every pause is durable.

## What counts as a quota

Agents and model providers reject with an `OutpostError` of code `quota`:

| Source                                 | Signal                                                                   | Reset time         |
| -------------------------------------- | ------------------------------------------------------------------------ | ------------------ |
| [Claude Code](../claude-code/)         | Rejected `rate_limit_event`, `rate_limit` or `billing_error`, limit text | From `resetsAt`    |
| [Codex](../codex/)                     | `usageLimitExceeded` or `rateLimitExceeded`, usage-limit text            | Unknown            |
| [Copilot CLI](../copilot-cli/)         | `session.error` of type `quota` or `rate_limit`, limit text              | Unknown            |
| [Kimi Code](../kimi-code/)             | Quota, balance or rate-limit text                                        | Unknown            |
| [Antigravity](../antigravity/)         | `RESOURCE_EXHAUSTED` or quota text                                       | Unknown            |
| [Model providers](../model-providers/) | HTTP 429, rate-limit or `insufficient_quota` stream error                | From `Retry-After` |

A CLI signal counts only when the agent process fails. Retry notices are not quotas. `quotaFault(error)` reads the message and `resetAt` of a caught quota error, even when wrapped.

A [fallback agent](../fallback-agents/) switches agents instead of waiting: the task pauses only when every candidate hits a limit.

## What happens after a quota error

Waiting in the process requires a known reset within `maxWaitMs`; otherwise the run stays paused. On a later start, an unknown or past reset permits an immediate attempt, while a reset too far away leaves the task paused.

<!-- canvas -->

- **Quota reached**: Save the pause without consuming a retry.
  - Workflow
  - → **Wait**: reset known within maxWaitMs
  - → **Paused**: reset unknown or too late
- **Wait**: Keep the process waiting until reset.
  - Runner
  - → **Resume**: reset reached
- **Paused**: Return the saved pause; independent tasks may finish.
  - Runner
  - → **Resume**: later start
- **Resume**: Continue captured conversation or run the task again as supported.
  - Workflow

The paused record in `result.tasks` holds `quota.resetAt`: schedule the next `start()` from it. `onQuota` authorizes the rerun, without `resume: "retry-incomplete"`. A [loop task](../verification-loops/) resumes the phase of the round that hit the limit.

## Continue the interrupted conversation

The first attempt after a pause receives `context.quota`: the captured conversation and the retained work branch.

| Task or call                                                                  | Next attempt                                                                                                   |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`defineAgentTask()`](../../reference/defineagenttask/)                       | Continues the conversation in your sandbox and workspace.                                                      |
| [`defineIsolatedTask()`](../../reference/defineisolatedtask/)                 | Continues it in a new sandbox, on the same branch; an integrated workspace starts from the interrupted branch. |
| [`defineInteractiveAgentTask()`](../../reference/defineinteractiveagenttask/) | Continues the conversation of the interrupted turn.                                                            |
| [`defineQueuedTask()`](../../reference/definequeuedtask/)                     | Publishes a new job, `<key>:quota:<attempt>`, with the original `idempotencyKey`.                              |
| [`speculate()`](../../reference/speculate/)                                   | In a durable race, reruns the candidates a limit stopped, in new conversations.                                |

A continued turn sends a short resume instruction instead of the brief. Set `quotaResume: "restart"` on an agent or isolated task to send the original request again.

Claude Code, Codex, Copilot CLI and Kimi Code can continue. A [fallback agent](../fallback-agents/) restarts from its first candidate with the original brief.

## Pass the conversation to a queued handler

A worker stores a handler's quota error in `QueueResult.quota`, and `defineQueuedTask()` rejects with code `quota`. Pass the conversation through the task input:

```ts
import { defineQueuedTask } from "@elie-laloum/outpost";
import type { TaskQueue } from "@elie-laloum/outpost";

function implement(queue: TaskQueue) {
  return defineQueuedTask({
    key: "implement",
    queue,
    handler: "implement",
    input: (context) => ({ continueFrom: context.quota?.conversation ?? null }),
    decode: String,
  });
}
```

The handler then dispatches with `continuation: { id: input.continueFrom }`. [Job queues](../job-queues/) covers workers and idempotency keys.

## Pause on a speculation quota

When limits stop candidates and none wins, `speculate()` returns status `quota` with the earliest known reset. Throw it from a task to pause the workflow:

```ts
import { OutpostError, speculate, defineTask } from "@elie-laloum/outpost";
import type { SpeculationOptions } from "@elie-laloum/outpost";

function race(options: SpeculationOptions) {
  return defineTask({
    key: "race",
    async perform() {
      const result = await speculate(options);
      if (result.status === "quota" && result.quota)
        throw new OutpostError("quota", result.quota.message, {
          ...(result.quota.resetAt ? { resetAt: result.quota.resetAt } : {}),
        });
      return result.winner?.branch ?? null;
    },
  });
}
```

A [durable race](../speculation/) then reruns only those candidates, with cumulative budgets. Without durability, every candidate runs again.

## Limits

- `start()` rejects `onQuota` without a checkpoint.
- Each rerun counts against `budget.attempts`. The workflow `timeoutMs` also ends waits, and a cancelled wait leaves the task paused.
- Reset times written in the agent's text are not parsed; they stay in the message.
- Other agents, disabled capture, a request with its own `continuation` or several `passes` restart from the brief.
- Uncommitted changes of an interrupted integrated attempt stay in its [retained worktree](../recovery/).
- Workers forward only conversations captured by the handler's dispatch.

API: [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [WorkflowQuotaPause](../../reference/workflowquotapause/) · [QuotaResumePolicy](../../reference/quotaresumepolicy/) · [quotaFault](../../reference/quotafault/) · [TaskContext](../../reference/taskcontext/) · [QueueResult](../../reference/queueresult/) · [WorkflowOptions](../../reference/workflowoptions/)
