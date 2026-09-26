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

API: [WorkflowBudget](../../reference/workflowbudget/) · [WorkflowUsage](../../reference/workflowusage/).
