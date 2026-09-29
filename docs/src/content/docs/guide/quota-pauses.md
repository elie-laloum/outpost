---
title: "Quota pauses"
description: "Pause a workflow when a subscription or API limit is reached, then resume it after the reset without spending retries or losing the conversation."
---

## Pause instead of failing

Set `onQuota` on `start()`. A task that hits a usage limit or an HTTP 429 then pauses instead of failing.

```ts
import {
  createLocalTransport,
  OutpostError,
  defineTask,
  defineWorkflow,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";

let calls = 0;
const review = defineTask({
  key: "review",
  perform: () => {
    if (++calls === 1)
      throw new OutpostError("quota", "You've hit your session limit", {
        resetAt: new Date(Date.now() + 1_000).toISOString(),
      });
    return "reviewed";
  },
});
const result = await defineWorkflow("nightly", [review]).start({
  checkpoint: {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({ directory: ".outpost/storage" }),
    }),
    runId: "nightly-2026-09-28",
    version: "1",
  },
  onQuota: { action: "pause", maxWaitMs: 6 * 60 * 60_000 },
});
result.unwrap();
console.log(result.value(review));
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

<!-- flow -->

1. **Pause**: The attempt that hit the limit ends.
   - **Keep the retries**: The error does not consume `retry` attempts.
   - **Save the pause**: The task becomes `paused` with a `quota` record, and the checkpoint is saved.
2. **Wait**: Only when the reset time is known.
   - **Wait in the process**: A reset within `maxWaitMs` emits a `quota` event with `status: "waiting"`, then runs the task again.
   - **Pause durably**: Otherwise the task stays paused. Independent tasks continue, dependent tasks wait, and `start()` returns `paused`.
3. **Resume**: A later `start()` with the same checkpoint.
   - **Run again**: An unknown or past reset runs the task at once.
   - **Wait first**: A reset within `maxWaitMs` is awaited, then the task runs.
   - **Stay paused**: A later reset leaves the task paused without calling the agent.

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
