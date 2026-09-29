---
title: "Follow progress"
description: "Display progress while an agent runs."
---

Use `observe` for normalized agent events and `createReporter()` for ready-made terminal output.

```ts
import { dispatch, createReporter } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: createReporter({ label: "API review" }),
});
console.log(result.usage);
```

## Handle events yourself

An observation includes `kind`, `pass` and `at`. Narrow on `kind` before reading fields: `text-delta` carries text, `tool` identifies a call, and `usage` carries token counts. Unsupported protocol events may appear as `raw` observations.

Observers report progress; throwing inside one does not cancel the agent. Supply an abort signal to stop execution. Avoid sending raw events to a public log because tool arguments and output may include repository content.

## Instrument a workflow

`workflow.start({ observe })` emits task transitions, attempts, retries, usage and completion. Observer errors are collected in `observerErrors` independently of task errors. For metrics and traces use the optional [telemetry adapter](../journals/).

API: [AgentObservation](../../reference/agentobservation/) · [createReporter](../../reference/createreporter/) · [WorkflowEvent](../../reference/workflowevent/).

## CLI event coverage

Claude and Codex expose tool identifiers and results, and readable reasoning where present. Claude supports `createClaudeHarness({ partialMessages: true })`, emits per-message `message-usage` independently of authoritative turn totals, and preserves parent tool identifiers. Codex also emits structured `file-change` events. Copilot and Kimi correlate tool results using their native call identifiers. Antigravity uses its conversation and step index; a completed tool without exposed output has an empty preview, not a reconstructed result.

`stderr` contains bounded lines/fragments. `stopped` distinguishes completion-triggered termination, idle timeout, deadline, cancellation and oversized protocol output. Oversized output is reported with a bounded raw preview and the observed UTF-8 size before failure. Interactive TTY attachment has no structured stream.

API: [createObservationHub](../../reference/createobservationhub/) · [Observation](../../reference/observation/) · [ObservationSink](../../reference/observationsink/).
