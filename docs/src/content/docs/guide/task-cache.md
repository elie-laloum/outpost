---
title: "Task result cache"
description: "Reuse a task's JSON result instead of executing it again with the same inputs."
---

Available since 8.0.0. A task with a `cache` fingerprints its inputs and stores its JSON result in a Transport. A later execution with the same fingerprint restores that result instead of running the task, so a repeated review or analysis is not paid for twice.

```ts
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localTransport,
  task,
  taskCacheStore,
  workflow,
} from "@elie-laloum/outpost";

const directory = await mkdtemp(join(tmpdir(), "outpost-cache-"));
const store = taskCacheStore({ transporter: localTransport({ directory }) });
let executions = 0;
const summarize = () =>
  task({
    key: "summary",
    cache: { store, version: "summary-v1", key: () => ["notes", "v7.1"] },
    perform: () => ({ summary: "3 fixes", execution: ++executions }),
  });

for (let run = 1; run <= 2; run++) {
  const summary = summarize();
  const result = await workflow("release-notes", [summary]).start();
  result.unwrap();
  console.log(result.value(summary), result.tasks[0]?.cacheHit ?? false);
}
// { summary: '3 fixes', execution: 1 } false
// { summary: '3 fixes', execution: 1 } true
```

<!-- check:run -->

## Choose the key

`key(ctx)` returns the lossless JSON inputs that determine the result. The fingerprint combines it with the workflow name, the task key and `version`. Object key order does not matter. The callback runs before each execution with `attempt` 0 and can read declared dependencies with `ctx.value()`. An exception, or a value that is not lossless JSON, fails the task.

Include everything that can change the answer: the repository state, the brief, the agent and model, and relevant dependency values. `repositoryFingerprint()` hashes `HEAD`, tracked changes, the index and untracked files (excluding `.outpost/`), so an uncommitted edit changes the key. A commit ID alone would reuse a result computed for a different working tree.

```ts
import {
  agentTask,
  localTransport,
  repositoryFingerprint,
  task,
  taskCacheStore,
} from "@elie-laloum/outpost";
import type { Sandbox } from "@elie-laloum/outpost";

declare const session: Sandbox;
const repository = "/projects/app";
const brief = "Review the parser for unsafe input handling.";
const store = taskCacheStore({
  transporter: localTransport({ directory: `${repository}/.outpost/storage` }),
});
const reviewer = agentTask({
  key: "reviewer",
  sandbox: session,
  request: () => ({ brief: { text: brief } }),
});
const review = task({
  key: "review",
  cache: {
    store,
    version: "review-v1",
    key: async () => [
      await repositoryFingerprint(repository),
      brief,
      "claude-sonnet-5",
    ],
  },
  async perform(ctx) {
    const result = await reviewer.perform(ctx);
    return { text: result.text };
  },
});
```

`version` is required. Change it when the task implementation, agent configuration, prompt or output contract changes. Outpost does not invalidate entries on upgrades or code changes it cannot see.

## What a hit restores

A hit restores only the stored value. It records no attempt and no usage, consumes no attempt budget, and sets `TaskRecord.cacheHit`. Dependent tasks receive the restored value as usual.

Nothing else is replayed: no files, commits, branches, sandbox state, artifacts or external calls. Cache only tasks whose value is the product, such as reviews, classifications, summaries or analyses. A cached value naming a commit does not put that commit on your current branch.

Results must be lossless JSON or `undefined`. Otherwise the task fails after it executes, without retrying. `agentTask` and `isolatedTask` reject `cache` because their dispatch result is not JSON; cache a task that returns a projection, as above. Gates and interactive tasks also reject it. `loopTask` accepts `cache`: a hit skips every round.

## Expiry and refresh

`maxAgeMs` treats an older entry as a miss; the task runs and replaces it. `mode: "refresh"` ignores existing entries, runs the task and replaces its entry, for example to repopulate the cache after a model update.

## Failures and events

Each cached task emits `WorkflowEvent` with `type: "cache"` and `cache` set to `hit`, `miss`, `stored` or `failed`. Exhaustive event consumers must handle this type.

The cache never decides the task outcome. If the store cannot be read, an entry is corrupt or belongs to another fingerprint, or the result cannot be written, the event is `failed` with an `error` message and the task runs or completes normally. Cancellation still cancels the task.

There is no single-flight coordination: concurrent executions with the same fingerprint all run, and the first entry written is kept. With [checkpoints](../durable-runs/), a completed task is restored from the checkpoint without consulting the cache, and `cacheHit` is persisted with its record.

## Trust and retention

Entries are neither signed nor authenticated. Anyone who can write the transport controls the values tasks restore. Use a transport at least as trusted as the repository, and do not share it across trust boundaries. Entries contain task outputs, which may be sensitive.

`taskCacheStore` stores entries under `task-cache/<fingerprint>.json`. They are kept until you remove them: add the `task-cache` scope to a [retention policy](../retention-rules/) to prune entries older than `minAgeMs`.

API: [TaskCacheOptions](../../reference/taskcacheoptions/) · [taskCacheStore](../../reference/taskcachestore/) · [repositoryFingerprint](../../reference/repositoryfingerprint/) · [TaskCacheEntry](../../reference/taskcacheentry/).
