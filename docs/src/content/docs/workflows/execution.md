---
title: "Concurrency, retries and failures"
description: "Concurrency, retries and failures — Outpost"
sidebar:
  order: 2
---

`workflow.start()` accepts `concurrency`, `stopOnError`, `signal` and `observe`. Concurrency defaults to `1`. Ready independent tasks run up to the concurrency limit. Shared resources still need explicit serialization through dependencies.

```ts
import { task, workflow } from "@elie-laloum/outpost";
import { setTimeout } from "node:timers/promises";

const work = task({
  key: "work",
  timeoutMs: 5_000,
  retry: {
    attempts: 3,
    delayMs: 100,
    accepts: (error) => error instanceof Error,
  },
  async perform(context) {
    await setTimeout(20, undefined, { signal: context.signal });
    return context.attempt;
  },
});
const result = await workflow("retry-example", [work]).start({
  concurrency: 1,
  stopOnError: false,
  observe: (event) => console.log(event.type, event.key, event.status),
});
result.unwrap();
```

`retry.attempts` is the total attempt budget, including the initial attempt. `delayMs` is the pause between eligible retries. `accepts(error, attempt)` can filter failures. Cancellation interrupts retry delays. Make retried operations idempotent or record enough state to avoid repeating external side effects.

`stopOnError` defaults to `true`: a failed task aborts active siblings. With `false`, independent branches can finish; descendants of a failed task remain skipped. External cancellation yields a cancelled workflow.

Task `timeoutMs` is cooperative. It aborts the task signal, but JavaScript cannot forcibly stop arbitrary callbacks. The scheduler waits for active tasks to clean up rather than returning while they still mutate resources.

Observer event types are `start`, `task`, `attempt`, `usage`, `retry` and `finish`, with execution ID, workflow name, timestamp and optional task/status/attempt. Callback exceptions are recorded in `observerErrors`, not used to change outcomes.
