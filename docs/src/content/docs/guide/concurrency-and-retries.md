---
title: "Concurrency, retries and timeouts"
description: "Run independent tasks in parallel, retry the ones that fail, bound their duration and decide what a failure stops."
---

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const flaky = defineTask({
  key: "flaky",
  retry: { attempts: 3, delayMs: 100 },
  perform: ({ attempt }) => {
    if (attempt < 2) throw new Error("Temporary failure");
    return { attempt };
  },
});
const lint = defineTask({ key: "lint", perform: () => "clean" });

const result = await defineWorkflow("checks", [flaky, lint]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(flaky)); // { attempt: 2 }
```

<!-- check:run -->

`flaky` and `lint` start together. `flaky` fails once, waits 100 ms and succeeds on its second attempt; its task record in `result.tasks` shows `attempts: 2`.

## Run tasks in parallel

`start({ concurrency })` sets how many tasks run at once. The default is `1`: tasks run one after another. A task still waits for every task in its `after` list.

:::caution
Tasks that share a sandbox must not run at the same time. Order them with `after`, or give each its own sandbox with `defineIsolatedTask()`.
:::

## Retry a failing task

A task runs once unless you give it a `retry` policy.

| Option       | Default                                 | Effect                                                 |
| ------------ | --------------------------------------- | ------------------------------------------------------ |
| `attempts`   | Required                                | Total attempts, the first one included.                |
| `delayMs`    | `0`                                     | Wait before each retry.                                |
| `backoff`    | `"fixed"`                               | `"exponential"` doubles the wait after each failure.   |
| `maxDelayMs` | 30 000 in exponential mode, else no cap | Upper bound on the computed wait.                      |
| `jitter`     | `"none"`                                | `"full"` picks a random wait between zero and the cap. |
| `accepts`    | Every error is retried                  | `(error, attempt) => boolean`; `false` fails the task. |

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
const result = await defineWorkflow("requests", [request]).start();
result.unwrap();
console.log(result.tasks[0]?.attempts); // 1
```

<!-- check:run -->

Each retry emits a `retry` event with its `delayMs` (see [Follow progress](../progress/)). Retries count against `budget.attempts` when you set a [budget](../budgets/).

### Honour `Retry-After`

[Model providers](../model-providers/) copy a valid `Retry-After` header into `OutpostError.details.retryAfterMs`. The retry then waits at least that long, even beyond `maxDelayMs` and whatever the jitter. Your own code can throw an `OutpostError` with `details.retryAfterMs` in milliseconds to get the same behaviour.

## Set timeouts

| Setting                | Covers                                                                                      | When it expires                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Task `timeoutMs`       | One attempt.                                                                                | The attempt’s `signal` aborts with the error `<key> timed out`; the task retries if attempts remain.                                |
| `start({ timeoutMs })` | The whole `start()` call: checkpoint acquisition, conditions, every attempt and retry wait. | Running tasks are cancelled, nothing new starts, `status` is `"failed"` and `errors` holds an `OutpostError` with code `"timeout"`. |

```ts
import { setTimeout as sleep } from "node:timers/promises";
import { OutpostError, defineTask, defineWorkflow } from "@elie-laloum/outpost";

const slow = defineTask({
  key: "slow",
  timeoutMs: 200,
  retry: { attempts: 2 },
  perform: ({ signal }) => sleep(5_000, "late", { signal }),
});
const result = await defineWorkflow("deadline", [slow]).start({
  timeoutMs: 300,
});
console.log(
  result.status,
  result.errors.map((error) =>
    error instanceof OutpostError ? error.code : error,
  ),
); // failed [ 'timeout' ]
```

<!-- check:run -->

The first attempt times out after 200 ms, the second is cancelled by the workflow deadline at 300 ms. Both values are positive integers of at most 2,147,483,647 ms. Each resumed `start()` gets a fresh deadline; the time between calls does not count.

## Choose what a failure stops

A task fails when its last attempt fails. What happens next depends on `stopOnError`.

| Other tasks       | `stopOnError: true` (default)                | `stopOnError: false`                                         |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Running           | Their `signal` aborts; they end `cancelled`. | Continue.                                                    |
| Not started       | End `cancelled`.                             | Dependents of the failed task end `skipped`; the others run. |
| Workflow `status` | `"failed"`                                   | `"failed"`                                                   |

`unwrap()` throws a `WorkflowFailure` unless `status` is `"done"`. Read `result.tasks` for each task’s `status`, `attempts` and `error`, and `result.errors` for the failures themselves.

## Skip a task with a condition

`condition` runs once, before the first attempt. When it returns `false`, the task ends `skipped` and so do the tasks that depend on it.

```ts
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const changes = defineTask({ key: "changes", perform: () => ["README.md"] });
const tests = defineTask({
  key: "tests",
  after: [changes],
  condition: (context) =>
    context.value(changes).some((file) => file.endsWith(".ts")),
  perform: () => "Tests passed",
});
const result = await defineWorkflow("docs-only", [changes, tests]).start();
result.unwrap();
console.log(result.tasks.map((task) => `${task.key}: ${task.status}`));
// [ 'changes: done', 'tests: skipped' ]
```

<!-- check:run -->

A skipped task has no value: `result.value(tests)` throws.

## Cancel a run

Pass an `AbortSignal` as `start({ signal })`. It aborts every running task’s `context.signal`, and the workflow ends with `status: "cancelled"`.

Agent, command and isolated tasks forward `context.signal` for you. In `defineTask()`, pass it to every command, request and wait your code starts.

## Limits

- Cancellation is cooperative: code that ignores `context.signal` keeps running until it returns, even past the workflow deadline; its value is then discarded.
- A retry runs the whole task again and can repeat its side effects. Deduplicate them with `context.idempotencyKey`, which stays the same across retries: see [Job queues and workers](../job-queues/).
- Each `start()` call, such as a checkpoint resume or a resume after a quota pause, allows `retry.attempts` again and restarts the backoff from `delayMs`; attempt numbers stay cumulative in a checkpoint.
- With [quota pauses](../quota-pauses/) enabled, a quota error pauses the task instead of retrying it.
- Retry settings, task timeouts and the presence of a condition are part of the checkpoint identity: changing them rejects an existing checkpoint (see [Durable runs](../durable-runs/)).

API: [defineTask](../../reference/definetask/) · [Retry](../../reference/retry/) · [TaskOptions](../../reference/taskoptions/) · [WorkflowOptions](../../reference/workflowoptions/) · [WorkflowResult](../../reference/workflowresult/) · [OutpostError](../../reference/outposterror/)
