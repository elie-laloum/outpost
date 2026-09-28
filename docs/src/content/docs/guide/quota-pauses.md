---
title: "Quota pauses"
description: "Pause a workflow when a subscription or API limit is reached and resume it after the reset."
---

Available since 8.0.0. With `onQuota`, a task that hits a usage limit or an HTTP 429 pauses instead of failing. The workflow resumes it after the reset, either in the same `start()` call or in a later one with the same checkpoint.

```ts
import {
  localTransport,
  OutpostError,
  task,
  workflow,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

let calls = 0;
const review = task({
  key: "review",
  perform: () => {
    if (++calls === 1)
      throw new OutpostError("quota", "You've hit your session limit", {
        resetAt: new Date(Date.now() + 50).toISOString(),
      });
    return "reviewed";
  },
});
const result = await workflow("nightly", [review]).start({
  checkpoint: {
    store: workflowCheckpointStore({
      transporter: localTransport({ directory: ".outpost/storage" }),
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

Here the simulated limit resets after 50 ms, within `maxWaitMs`, so the workflow waits and then runs the task again. In real use, agent and model tasks raise quota errors themselves.

## What counts as a quota

Outpost rejects with `OutpostError` code `quota` when:

| Source                      | Signal                                                                                | Reset time                    |
| --------------------------- | ------------------------------------------------------------------------------------- | ----------------------------- |
| Claude Code                 | rejected `rate_limit_event`, `rate_limit`/`billing_error` assistant error, limit text | From `resetsAt` when reported |
| Codex                       | usage-limit, quota-exceeded or exhausted-429 failure text                             | Unknown                       |
| GitHub Copilot CLI          | `session.error` of type `quota` or `rate_limit`, limit text                           | Unknown                       |
| Kimi Code                   | quota-exhaustion text on its failure output or stderr                                 | Unknown                       |
| Antigravity                 | quota-exhausted or `RESOURCE_EXHAUSTED` failure text                                  | Unknown                       |
| OpenAI and Anthropic models | HTTP 429, or a stream error of a rate-limit or insufficient-quota type                | From `Retry-After` when valid |

For CLI agents, a signal only reclassifies a turn whose agent process fails. Transient retry notices, such as Claude `api_retry` or Kimi `turn.step.retrying`, are not quotas. Human-readable reset times are not parsed; they stay in the message.

Use `quotaFault(error)` to read the message and reset time of a caught error, including a wrapped one.

## Pause and resume

A quota error ends the current attempt; it does not consume `retry` attempts. The task becomes `paused` with a `quota` record, and the checkpoint is saved. Then:

- When the reset is known, in the future and within `maxWaitMs`, the task waits in the process and runs again. A `quota` event reports `status: "waiting"` and `delayMs`.
- Otherwise, the task stays paused. Independent tasks continue; dependent tasks wait. The workflow returns `paused` when nothing else can run.
- A later `start()` with the same checkpoint runs a quota-paused task again when its reset is unknown or past, or waits first when the reset is within its `maxWaitMs`. Later resets leave it paused without calling the agent.

`maxWaitMs` defaults to `0`: without it, pauses are always durable, so sandboxes and processes are not held for hours. Size it against your workflow `timeoutMs`, which also bounds waits.

Enabling `onQuota` authorizes the interrupted attempt to run again, like a retry; no `resume: "retry-incomplete"` is needed. Cancelling during a wait leaves the task paused. Every new run counts as an attempt against `budget.attempts`. A [verification loop](../verification-loops/) resumes the phase that hit the limit.

## Continue the interrupted conversation

The first attempt after a pause receives `context.quota`. It carries the conversation when it was captured, and the retained work branch.

- `agentTask` and `isolatedTask` continue that conversation. The new turn sends a short resume instruction instead of the original brief, and keeps the response tag when a structured response is expected. Set `quotaResume: "restart"` to send the original request again.
- `agentTask` keeps its caller-owned sandbox and workspace. `isolatedTask` allocates a new sandbox: a `current` or `named` branch reuses the same checkout, and an automatically integrated workspace starts from the interrupted branch. Uncommitted changes of an integrated attempt stay in its [retained worktree](../failure-recovery/).
- `interactiveAgentTask` continues the conversation of the interrupted turn.
- Continuation needs a resumable agent with conversation capture: Claude Code, Codex, Copilot or Kimi. Antigravity and disabled capture start a new conversation. So does a request with its own `continuation` or several `passes`.

Custom tasks can read `context.quota` to decide how to resume.

## Queued tasks

A worker whose handler fails with a quota error stores it in `QueueResult.quota`, and `queuedTask` rejects with code `quota`. The first attempt after the pause publishes a new job, `<key>:quota:<attempt>`, because the failed job cannot run again. The handler still receives the original `idempotencyKey`, so effect deduplication keeps working.

Pass the conversation to the handler through the input:

```ts
import { queuedTask } from "@elie-laloum/outpost";
import type { TaskQueue } from "@elie-laloum/outpost";

function implement(queue: TaskQueue) {
  return queuedTask({
    key: "implement",
    queue,
    handler: "implement",
    input: (context) => ({ continueFrom: context.quota?.conversation ?? null }),
    decode: String,
  });
}
```

The handler can then dispatch with `continuation: { id: input.continueFrom }`. Workers forward only conversations captured by the handler's dispatch.

## Speculation

A candidate stopped by a limit settles with status `quota`. When nothing wins, `speculate()` returns status `quota` and `result.quota` holds the earliest known reset. Throw it from a workflow task to pause the workflow:

```ts
import { OutpostError, speculate, task } from "@elie-laloum/outpost";
import type { SpeculationOptions } from "@elie-laloum/outpost";

function race(options: SpeculationOptions) {
  return task({
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

With [durability](../candidate-selection/#durable-races-and-recovery), the next `speculate()` call reruns only the candidates stopped by a limit, as new attempts from the baseline; budgets stay cumulative. Candidates do not continue their previous conversation. Without durability, every candidate runs again.

API: [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [WorkflowQuotaPause](../../reference/workflowquotapause/) · [quotaFault](../../reference/quotafault/) · [WorkflowOptions](../../reference/workflowoptions/).
