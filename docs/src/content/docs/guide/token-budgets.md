---
title: "Usage budgets"
description: "Bound shared attempts and observed token usage."
---

A workflow budget applies across tasks, retries and checkpoint resumes. Set an attempt limit, token limits, or both.

```ts
import { task, workflow } from "@elie-laloum/outpost";

const meter = task({
  key: "meter",
  perform(context) {
    context.reportUsage({ input: 10, cached: 0, output: 5 });
    return "recorded";
  },
});
const result = await workflow("bounded", [meter]).start({
  budget: { attempts: 5, usage: { input: 50_000, output: 10_000 } },
});
console.log(result.usage);
```

<!-- check:run -->

Agent task helpers report usage to their workflow. Custom tasks must report the usage they incur; unreported external calls cannot be counted. Receipt-based reporting can avoid counting the same durable result twice.

## What a budget guarantees

Budget checks govern admission using observed usage. Concurrent or already-running requests can consume tokens before their final usage arrives. These limits are not an exact monetary cap and do not replace account-level limits.

`result.usage` contains cumulative attempts and tokens. Checkpoints preserve that total when incomplete work is explicitly retried. A custom harness also supports per-loop limits; see [Model loop](../model-loop/).

## Incomplete accounting

`Usage.complete === false` means the counters are a lower bound, not a zero-cost run. The marker survives aggregation, failed attempts and checkpoints. Omitted `complete` preserves the existing contract for adapters and custom tasks; it is not independent proof that every external call was measured.

When a workflow or speculative race has token limits but no `budget.attempts`, incomplete usage stops execution with `WorkflowUsageUnavailable`. A CLI adapter declaring usage unavailable triggers this check before its command starts. Missing session counters discovered at exit stop subsequent work; they cannot undo tokens already spent. An attempt budget allows bounded fallback, with a warning and the incomplete marker preserved.

Use both limits together: `budget: { attempts: 3, usage: { input: 50_000 } }` on the workflow, `timeoutMs: 120_000` on each agent task, and `deadlineMs: 60_000` on its dispatch request. For `speculate()`, set the shared attempt budget and a deadline on each candidate request. An attempt is a task execution or speculative candidate, not an individual internal CLI model request. No global workflow duration limit is added.

For adapters using session accounting on continuation, a pre-command baseline excludes historical tokens. An unreadable baseline or an unmeasurable fork marks usage incomplete instead of charging inherited session totals.

Copilot and Kimi collect session counters after command completion. Their startup warning explains this delay. Reader failures never replace the original process error; absent or interrupted measurement is reported separately. See [Copilot](../copilot-cli/) and [Kimi](../kimi-code/) for the supported sources.

API: [WorkflowBudget](../../reference/workflowbudget/) · [WorkflowUsage](../../reference/workflowusage/).
