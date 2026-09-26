---
title: "Scheduling and retries"
description: "Control concurrency, failure propagation and attempts."
---

Set `concurrency` on `start()` and retry policy on individual tasks. Retries are explicit because a second attempt can repeat side effects.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const check = task({
  key: "check",
  retry: { attempts: 2, delayMs: 100 },
  timeoutMs: 5_000,
  perform: ({ signal, attempt }) => {
    signal.throwIfAborted();
    return { attempt, ok: true };
  },
});
const result = await workflow("checks", [check]).start({ concurrency: 2 });
result.unwrap();
console.log(result.status);
```

<!-- check:run -->

## Failure propagation

`stopOnError` stops admitting new work after failure when enabled. Dependency failures prevent downstream work from running successfully. Inspect each task record’s status and attempts, not only the workflow status.

`condition` runs before the first attempt. Use it to skip optional work based on declared dependencies. A skipped task does not provide a successful output to consume as if it ran.

## Cooperative cancellation

Pass `context.signal` to commands, fetches and agent requests. `timeoutMs` signals cancellation for an attempt; it cannot forcibly terminate arbitrary application code. `retry.accepts(error, attempt)` narrows which failures may be retried.

Do not run concurrent operations against one borrowed sandbox. Add dependency edges or allocate separate environments with `isolatedTask`.

API: [TaskOptions](../../reference/taskoptions/) · [WorkflowOptions](../../reference/workflowoptions/) · [Retry](../../reference/retry/).
