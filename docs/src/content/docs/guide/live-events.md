---
title: "Live events"
description: "Display progress while an agent runs."
---

Use `observe` for normalized agent events and `reporter()` for ready-made terminal output.

```ts
import { dispatch, reporter } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: reporter({ label: "API review" }),
});
console.log(result.usage);
```

## Handle events yourself

An observation includes `kind`, `pass` and `at`. Narrow on `kind` before reading fields: `text-delta` carries text, `tool` identifies a call, and `usage` carries token counts. Unsupported protocol events may appear as `raw` observations.

Observers report progress; throwing inside one does not cancel the agent. Supply an abort signal to stop execution. Avoid sending raw events to a public log because tool arguments and output may include repository content.

## Instrument a workflow

`workflow.start({ observe })` emits task transitions, attempts, retries, usage and completion. Observer errors are collected in `observerErrors` independently of task errors. For metrics and traces use the optional [telemetry adapter](../audit-trails/).

API: [AgentObservation](../../reference/agentobservation/) · [reporter](../../reference/reporter/) · [WorkflowEvent](../../reference/workflowevent/).
