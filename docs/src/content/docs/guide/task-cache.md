---
title: "Result cache"
description: "Reuse a task's JSON result when its inputs have not changed, so a repeated review or analysis is not paid for twice."
---

## Cache a task

Give a task a `cache` with a store, a `version` and a `key`. The second run finds an entry with the same fingerprint and restores its value without executing the task.

```ts
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createLocalTransport,
  defineTask,
  createTaskCacheStore,
  defineWorkflow,
} from "@elie-laloum/outpost";

const directory = await mkdtemp(join(tmpdir(), "outpost-cache-"));
const store = createTaskCacheStore({
  transporter: createLocalTransport({ directory }),
});
let executions = 0;
const summarize = () =>
  defineTask({
    key: "summary",
    cache: { store, version: "summary-v1", key: () => ["notes", "v7.1"] },
    perform: () => ({ summary: "3 fixes", execution: ++executions }),
  });

for (let run = 1; run <= 2; run++) {
  const summary = summarize();
  const result = await defineWorkflow("release-notes", [summary]).start();
  result.unwrap();
  console.log(result.value(summary), result.tasks[0]?.cacheHit ?? false);
}
// { summary: '3 fixes', execution: 1 } false
// { summary: '3 fixes', execution: 1 } true
```

<!-- check:run -->

The second run restores the first result: `execution` stays at 1 and `cacheHit` is `true`.

## Choose the key

The fingerprint combines the workflow name, the task key, `version` and the JSON value `key(ctx)` returns. Put in it everything that can change the answer.

| Input                                   | Where it goes                             |
| --------------------------------------- | ----------------------------------------- |
| Repository state, including local edits | `await repositoryFingerprint(repository)` |
| Brief or prompt text                    | The key                                   |
| Agent and model                         | The key                                   |
| Values from dependencies                | The key, read with `ctx.value(task)`      |
| Task code, output shape, configuration  | `version`: change it when they change     |

```ts title="review.mts"
import {
  createLocalTransport,
  createTaskCacheStore,
  defineIsolatedTask,
  defineTask,
  repositoryFingerprint,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const brief = "Review the parser for unsafe input handling. Do not edit files.";
const store = createTaskCacheStore({
  transporter: createLocalTransport({
    directory: `${repository}/.outpost/storage`,
  }),
});
const reviewer = defineIsolatedTask({
  key: "reviewer",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: brief },
  }),
});
const review = defineTask({
  key: "review",
  cache: {
    store,
    version: "review-v1",
    key: async () => [await repositoryFingerprint(repository), brief, "codex"],
  },
  perform: async (ctx) => {
    const { text } = await reviewer.perform(ctx);
    return { text };
  },
});
```

`repositoryFingerprint()` hashes `HEAD`, the index, uncommitted changes and non-ignored untracked files outside `.outpost/`, so a local edit changes the key. A key that throws or is not lossless JSON fails the task.

## Know what a hit restores

| On a hit                                                  | Result                                 |
| --------------------------------------------------------- | -------------------------------------- |
| Task value                                                | Restored and passed to dependent tasks |
| `TaskRecord.cacheHit`                                     | `true`                                 |
| Attempts, usage, attempt budget                           | None recorded or consumed              |
| Files, commits, branches, sandbox state, artifacts, calls | Not replayed                           |

Cache tasks whose value is the product: reviews, classifications, summaries, analyses.

## Pick a task that accepts a cache

The result must be lossless JSON or `undefined`; otherwise the task fails after it executes, without a retry.

| Task                                                                                                                                | `cache`                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`defineTask`](../../reference/definetask/) and helpers built on it (`defineCommandTask`, `defineArtifactTask`, `defineQueuedTask`) | Yes                                                         |
| [`defineLoopTask`](../../reference/definelooptask/)                                                                                 | Yes: a hit skips every round                                |
| `defineAgentTask`, `defineIsolatedTask`                                                                                             | No: call it from a `defineTask` that returns JSON, as above |
| Gates (`defineApprovalTask`, `definePauseTask`) and interactive tasks                                                               | No                                                          |

## Expire or refresh entries

| Option                 | Effect                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `maxAgeMs: 86_400_000` | An entry older than one day is a miss; the task runs and replaces it.                  |
| `mode: "refresh"`      | Skip the lookup, run the task and replace its entry, for example after a model update. |

## Watch cache events

```ts
import type { Workflow } from "@elie-laloum/outpost";

declare const workflow: Workflow;

await workflow.start({
  observe: (event) => {
    if (event.type === "cache")
      console.log(event.key, event.cache, event.error);
  },
});
```

| `event.cache` | Meaning                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `hit`         | The value was restored.                                                     |
| `miss`        | No usable entry: missing, expired, or `mode: "refresh"`.                    |
| `stored`      | The result was written after the task succeeded.                            |
| `failed`      | The store failed, or an entry was invalid; `event.error` holds the message. |

The cache never decides the outcome: after a `failed` read the task runs, after a `failed` write it completes normally.

## Protect and prune entries

:::caution
Entries are not authenticated: anyone who can write to the transport controls the values your tasks restore. Use a transport at least as trusted as the repository.
:::

Entries live under `task-cache/` in the transport until you remove them. Add the `task-cache` scope to a [retention policy](../retention/) to prune those older than `minAgeMs`.

## Limits

- Concurrent executions with the same fingerprint all run; the first entry written is kept.
- A task already completed in a [checkpoint](../durable-runs/) is restored from it without reading the cache.
- Entries are not invalidated when your code or agent changes: change `version`.
- `createTaskCacheStore` does not store entries above 16 MiB (`maxBytes`); the write reports `failed`.

API: [TaskCacheOptions](../../reference/taskcacheoptions/) · [createTaskCacheStore](../../reference/createtaskcachestore/) · [repositoryFingerprint](../../reference/repositoryfingerprint/) · [TaskCacheEntry](../../reference/taskcacheentry/) · [WorkflowEvent](../../reference/workflowevent/).
