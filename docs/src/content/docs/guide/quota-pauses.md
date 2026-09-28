---
title: "Quota pauses"
description: "Pause a workflow when a subscription or API limit is reached and resume it after the reset."
---

Implemented on main, not yet released. With `onQuota`, a task that hits a usage limit or an HTTP 429 pauses instead of failing. The workflow resumes it after the reset, either in the same `start()` call or in a later one with the same checkpoint.

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

A rerun starts a new agent dispatch. The interrupted conversation is available in the quota error's `details.conversation` for CLI agents, but the task does not continue it automatically.

API: [WorkflowQuotaPolicy](../../reference/workflowquotapolicy/) · [WorkflowQuotaPause](../../reference/workflowquotapause/) · [quotaFault](../../reference/quotafault/) · [WorkflowOptions](../../reference/workflowoptions/).
