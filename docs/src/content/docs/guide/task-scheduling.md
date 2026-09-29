---
title: "Scheduling and retries"
description: "Control concurrency, failure propagation and attempts."
---

Set `concurrency` on `start()` and retry policy on individual tasks. Retries are explicit because a second attempt can repeat side effects.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const check = defineTask({
  key: "check",
  retry: { attempts: 2, delayMs: 100 },
  timeoutMs: 5_000,
  perform: ({ signal, attempt }) => {
    signal.throwIfAborted();
    return { attempt, ok: true };
  },
});
const result = await defineWorkflow("checks", [check]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.status);
```

<!-- check:run -->

## Progressive retries

The existing fixed delay remains the default. Set `backoff: "exponential"` to double `delayMs` after each failure, `maxDelayMs` to cap the local delay (30 seconds by default in exponential mode), and `jitter: "full"` to spread retries uniformly between zero and that cap-adjusted delay. Jitter defaults to `"none"`. Configure a positive `delayMs` for a useful progressive wait.

```ts
import { OutpostError, defineTask, defineWorkflow } from "@elie-laloum/outpost";

const request = defineTask({
  key: "request",
  retry: {
    attempts: 4,
    delayMs: 500,
    backoff: "exponential",
    maxDelayMs: 10_000,
    jitter: "full",
    accepts: (error) =>
      error instanceof OutpostError &&
      [429, 503].includes(Number(error.details.status)),
  },
  perform: ({ signal }) => {
    signal.throwIfAborted();
    return "Replace with your cancellable request";
  },
});
const result = await defineWorkflow("requests", [request]).start({
  timeoutMs: 60_000,
});
result.unwrap();
```

HTTP model providers preserve valid `Retry-After` headers (seconds or an HTTP date) as `OutpostError.details.retryAfterMs`. The task retry waits at least that duration, even above `maxDelayMs`, and never randomizes below it. Invalid headers are ignored and dates in the past mean zero. Custom integrations can throw an `OutpostError` with a finite, nonnegative `details.retryAfterMs` no greater than `Number.MAX_SAFE_INTEGER`, expressed in milliseconds. Arbitrary HTTP client errors and CLI stderr are not parsed automatically.

Retries still require an explicit task policy and respect `accepts`. Providers do not retry requests themselves: replaying a task can repeat its earlier tool calls or other effects. Retry observation events expose the selected `delayMs`. Long waits are split into cancellable timer segments so they cannot overflow into immediate retries.

## Workflow deadline

`start({ timeoutMs })` starts one deadline before checkpoint acquisition and covers conditions, all attempts, dependency scheduling and retry waits. Task `timeoutMs` still applies independently to each attempt. Both timeout values must be positive integers within the runtime timer range (at most 2,147,483,647 milliseconds).

Expiration stops admission, cancels active tasks through `context.signal`, and returns `status: "failed"` with an `OutpostError` whose `code` is `"timeout"` in `errors`. An external cancellation that occurs first keeps `status: "cancelled"`. Already completed values remain available; late values are rejected. Cleanup and persistence are awaited: code or storage that ignores cancellation can delay completion beyond the deadline.

Each resumed `start()` call receives a fresh deadline; time between calls and approval pauses is not accumulated. Incomplete checkpoints still require `resume: "retry-incomplete"`. New retry settings participate in checkpoint identity; changing them rejects an existing checkpoint. Use a new runId, and update version when the workflow definition changes. Existing checkpoints without those settings retain their identity. Backoff restarts from the base delay on each call, while recorded attempt numbers and usage remain cumulative.

## Failure propagation

`stopOnError` stops admitting new work after failure when enabled. Dependency failures prevent downstream work from running successfully. Inspect each task record’s status and attempts, not only the workflow status.

`condition` runs before the first attempt. Use it to skip optional work based on declared dependencies. A skipped task does not provide a successful output to consume as if it ran.

## Cooperative cancellation

Pass `context.signal` to commands, fetches and agent requests. `timeoutMs` signals cancellation for an attempt; it cannot forcibly terminate arbitrary application code. `retry.accepts(error, attempt)` narrows which failures may be retried.

Do not run concurrent operations against one borrowed sandbox. Add dependency edges or allocate separate environments with `defineIsolatedTask`.

API: [TaskOptions](../../reference/taskoptions/) · [WorkflowOptions](../../reference/workflowoptions/) · [Retry](../../reference/retry/).
