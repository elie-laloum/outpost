---
title: "Build a typed workflow"
description: "Build a typed workflow — Outpost"
sidebar:
  order: 1
---

Define tasks, declare their dependencies, then run the graph. Task definitions can be reused; results belong to one execution.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform: async () => ({ ready: true }),
});
const change = task({
  key: "change",
  after: [inspect],
  condition: (context) => context.value(inspect).ready,
  perform: async (context) => ({ checked: context.value(inspect).ready }),
});
const delivery = workflow("delivery", [inspect, change]);
const result = await delivery.start({ concurrency: 2 });
result.unwrap();
console.log(result.value(change).checked);
console.log(delivery.diagram());
```

## Dependency rules

Keys must be unique. Every dependency must be present in the graph, and cycles are rejected before execution. `context.value(task)` uses the actual task object, not just its name, and only reads declared dependencies. A task can access a dependency’s typed result after it finishes successfully.

`condition(context)` runs before the first attempt. A false condition marks the task as skipped; its descendants are skipped too. A failed or cancelled dependency also prevents dependent work from running.

`TaskContext` exposes `signal`, one-based `attempt`, `executionId` and typed `value`. Use `signal` in asynchronous work so cancellation can finish cleanly.

## Result and visualization

`result.status` is `done`, `failed` or `cancelled`. `tasks` contains execution records with status, attempts, timestamps and optional error text. `errors` holds original failures; `observerErrors` holds callback failures. `result.unwrap()` throws `WorkflowFailure` when the run did not succeed; that error retains the result.

`delivery.diagram()` returns Mermaid text for the declared dependency graph. It does not execute tasks. Save or render it in a Mermaid-capable tool to inspect structure.

Continue with [execution policies](../execution/) or [sandbox tasks](../sandbox-tasks/).

See [usage budgets](../budgets/) for shared admission and token limits, and [telemetry](../../operations/telemetry/) for structured metrics.

Persist results across process restarts with [workflow checkpoints](../checkpoints/).
