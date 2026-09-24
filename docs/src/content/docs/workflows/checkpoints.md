---
title: Resume workflows from checkpoints
description: Persist workflow results and explicitly resume interrupted tasks.
sidebar:
  order: 5
---

Checkpoints are opt-in. They retain completed task values, execution identity, task records and cumulative attempt/token accounting across process restarts. Recreate the task graph with the same task keys and dependencies before resuming.

```ts
import {
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform: () => ({ ready: true }),
});
const delivery = workflow("delivery", [inspect]);
const result = await delivery.start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: ".outpost/workflows" }),
    runId: "delivery-ticket-42",
    version: "implementation-and-inputs-v1",
  },
});
result.unwrap();
console.log(result.value(inspect).ready);
```

The directory resolves from the current working directory. Use an absolute path when workflow launch locations vary. A run ID identifies one persistent execution; use a new run ID for independent work. A completed run returns its saved values without performing its tasks again. Without `checkpoint`, every `start()` remains a fresh execution.

## Restart and replay policy

By default, an interrupted or failed checkpoint is rejected before running any task. A clean [approval or pause](../approvals/) can be reopened without replay authorization; pending requests and terminal rejections remain unchanged. Set `checkpoint.resume: "retry-incomplete"` to authorize replay of tasks that did not finish successfully. Completed tasks remain done; other tasks, including dependency skips, return to waiting and their conditions are evaluated again. A fully completed graph or clean pause retains its conditional skips. Accepted decisions and rejected gates are never replayed.

The stable execution ID and cumulative one-based `context.attempt` survive restarts. Each replay gets a new retry cycle according to the task's retry policy; workflow attempt and token budgets still include earlier executions. Existing per-task records retain attempts, while replay replaces the latest start/finish/error fields.

An interrupted task may have completed an external side effect before its successful result was saved. Use idempotent operations or an external reconciliation step before authorizing replay. Checkpoints do not provide exactly-once side effects. Completed task outputs are committed before their dependents can start; failed checkpoint writes stop scheduling, cancel active tasks and await their cleanup before releasing ownership.

`reportUsage()` queues a checkpoint write. Task completion awaits persistence. Within a long task, `await context.checkpoint?.()` flushes the current attempt and reported usage explicitly. An abrupt process crash can lose usage not yet flushed; usage never reported by an external provider cannot be reconstructed.

## Identity and output contract

The stored identity includes the workflow name, graph keys and edges, retry/timeout configuration, condition presence, gate kind/prompt/actors and caller-provided `version`. Change `version` whenever implementations, conditions, retry predicates or inputs change: function bodies and captured variables cannot be fingerprinted reliably. A version or graph mismatch fails before execution; select a new run ID for the changed workflow.

Outputs must be lossless JSON values, or top-level `undefined` for tasks with no result. Nested `undefined`, sparse arrays, accessors, functions, class instances, symbols, cycles, non-finite numbers, negative zero and `BigInt` are rejected as task failures. Convert dates and domain objects into explicit plain data in `perform()` and reconstruct them in dependent tasks. Store large artifacts separately and return a reference.

## Storage and ownership

`WorkflowCheckpointStore` is a domain port. `acquire(runId)` returns an exclusive lease with `read`, `write` and `release`; custom adapters must retain exclusivity until all writes finish and atomically replace snapshots. `read` returns `undefined` for a new run; persisted snapshots are versioned and validated before any task executes.

The filesystem adapter writes private files (0600) using temporary files, file synchronization and atomic replacement, plus parent-directory synchronization on POSIX. Each checkpoint is limited to 16 MiB. Local process locks reject concurrent owners, reclaim confirmed dead owners and refuse uncertain ownership. This adapter is for a local filesystem with local process ownership, not a distributed or network-filesystem lock. Checkpoints can contain sensitive results; protect the directory and keep it outside tracked content. Recovery preserves checkpoint data until you explicitly remove it.

See [execution policies](../execution/) and [usage budgets](../budgets/) for cancellation, retries and admission limits.

A full `DispatchResult` contains continuation functions and cannot be checkpointed directly. Call `dispatch` inside a task, forward its signal and report its usage, then return plain data such as `result.value`. An artifact task can publish that data and return a JSON reference; see [typed artifacts](../artifacts/).
