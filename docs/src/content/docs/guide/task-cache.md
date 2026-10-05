---
title: "Reuse task results"
description: "Cache JSON outputs when a task can safely reuse a result for the same inputs."
---

## Cache a task

Add a cache policy when a task can reuse the same JSON result for the same inputs. Give the policy a store, a version and a key that identifies the inputs affecting the result.

<!-- tabs -->

```ts title="cache-store.ts"
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createTaskCacheStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const directory = await mkdtemp(join(tmpdir(), "outpost-cache-"));
export const store = createTaskCacheStore({
  transporter: createLocalTransport({ directory }),
});
```

```ts title="summarize.ts"
import { defineTask } from "@elie-laloum/outpost";
import { store } from "./cache-store.ts";

export let executions = 0;
export const summarize = () =>
  defineTask({
    key: "summary",
    cache: { store, version: "summary-v1", key: () => ["notes", "v7.1"] },
    perform: () => ({ summary: "3 fixes", execution: ++executions }),
  });
export function executionCount() {
  return executions;
}
```

```ts title="run-cache.ts"
import { reportValue } from "./reporter.ts";
import { summarize } from "./summarize.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

for (let run = 1; run <= 2; run++) {
  const summary = summarize();
  const result = await defineWorkflow("release-notes", [summary]).start();
  result.unwrap();
  reportValue(result.value(summary), result.tasks[0]?.cacheHit ?? false);
  // Example output (second run): { summary: '3 fixes', execution: 1 } true
}
```

<!-- check:run -->

The second run restores the first result: `execution` stays at 1 and `cacheHit` is `true`.

## Choose the key

The fingerprint combines the workflow name, the task key, `version` and the JSON value `key(ctx)` returns. Put in it everything that can change the answer.

API reference: [TaskCacheOptions](../../reference/taskcacheoptions/) and [TaskCacheEntry](../../reference/taskcacheentry/).

<!-- tabs -->

```ts title="review-cache.ts"
import {
  createTaskCacheStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

export const brief =
  "Review the parser for unsafe input handling. Do not edit files.";
export const store = createTaskCacheStore({
  transporter: createLocalTransport({
    directory: `${repository}/.outpost/storage`,
  }),
});
```

```ts title="review-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { brief } from "./review-cache.ts";

export const reviewer = defineIsolatedTask({
  key: "reviewer",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: brief },
  }),
});
```

```ts title="review.ts"
import { defineTask, repositoryFingerprint } from "@elie-laloum/outpost";
import { store, brief } from "./review-cache.ts";
import { repository } from "./outpost.config.ts";
import { reviewer } from "./review-task.ts";

export const review = defineTask({
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

## Understand a cache hit

| On a hit                                                  | Result                                 |
| --------------------------------------------------------- | -------------------------------------- |
| Task value                                                | Restored and passed to dependent tasks |
| `TaskRecord.cacheHit`                                     | `true`                                 |
| Attempts, usage, attempt budget                           | None recorded or consumed              |
| Files, commits, branches, sandbox state, artifacts, calls | Not replayed                           |

Cache tasks whose value is the product: reviews, classifications, summaries, analyses.

## Pick a task that accepts a cache

The result must be lossless JSON or `undefined`; otherwise the task fails after it executes, without a retry.

API reference: [TaskCacheOptions](../../reference/taskcacheoptions/), [TaskOptions](../../reference/taskoptions/) and [QueuedTaskOptions](../../reference/queuedtaskoptions/).

## Expire or refresh entries

API reference: [TaskCacheOptions](../../reference/taskcacheoptions/).

## Watch cache events

Log cache outcomes from the workflow observer to see hits, misses and storage errors. A cache failure does not prevent the task from running or completing.

```ts
import { reportValue } from "./reporter.ts";
import type { Workflow } from "@elie-laloum/outpost";

declare const workflow: Workflow;

await workflow.start({
  observe: (event) => {
    if (event.type === "cache")
      reportValue(event.key, event.cache, event.error);
    // Example output: summary hit undefined
  },
});
```

API reference: [TaskCacheOutcome](../../reference/taskcacheoutcome/).

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
- Do not cache a `defineArtifactTask` read by a later task: a hit in a new run restores a reference to the earlier run, and `readArtifact()` fails with “Artifact dependency producer mismatch”.

API: [TaskCacheOptions](../../reference/taskcacheoptions/) · [createTaskCacheStore](../../reference/createtaskcachestore/) · [repositoryFingerprint](../../reference/repositoryfingerprint/) · [TaskCacheEntry](../../reference/taskcacheentry/) · [WorkflowEvent](../../reference/workflowevent/).
