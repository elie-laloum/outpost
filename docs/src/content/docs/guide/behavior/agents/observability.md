---
title: "Events, logs and usage"
description: "Events, logs and usage — Outpost"
sidebar:
  order: 11
---

Use `reporter` for readable terminal output or `observe` for structured integration.

```ts
import {
  agent as composeAgent,
  dispatch,
  codexHarness,
  reporter,
} from "@elie-laloum/outpost";

const result = await dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  brief: { text: "Inspect and summarize the repository." },
  label: "inspection",
  observe: reporter({ label: "inspection", verbose: false }),
  warn: console.warn,
  logging: { verbose: true },
});
console.log(result.usage, result.logReference);
```

## Events

`AgentObservation` adds a one-based `pass` and ISO timestamp `at` to normalized events. Kinds are `phase`, `prompt`, `text`, `text-delta`, `result`, `tool`, `tool-result`, `tool-denied`, `step`, `stop-prevented`, `compaction`, `conversation`, `usage`, `summary`, `warning`, `failure`, `finished` and `raw`. Custom harnesses emit `step` before each model request, `tool-result` with a bounded preview after each tool call, `tool-denied` when permissions or a hook refuse a call `stop-prevented` when a stop hook refuses the answer and `compaction` when a context strategy rewrites the history; their `tool` events carry a `callId`. Use the discriminant before reading kind-specific fields. Unknown protocol data remains available as `raw`.

Observer and warning callback exceptions do not fail the job. Do not use an observer to enforce critical business rules: validate the returned result instead. `reporter` accepts `label`, `verbose`, `quiet` and a custom `write(text)` function.

## Logging

Journals use immutable event segments and a versioned index through `Transport`. The default is `localTransport({ directory: resolve(repository, ".outpost/storage") })`. Set `logging: false` to disable persistence, `"stdout"` for terminal output, or `{ transporter, verbose }` to choose storage. Verbose journals include raw protocol events and streamed `text-delta` fragments.

Each dispatch owns a separate journal, even with a shared transport. Read `result.logReference` with `readJournal({ transporter, reference: result.logReference })`. Closing is idempotent and conditionally marks the index closed for retention; there is no JSONL sidecar or append-to-file option.

## Token accounting

`Usage` contains `input`, `cached` (cache read), optional `cacheCreated` (cache creation), and `output`. Each turn records `durationMs` and usage; the result aggregates turns. Claude native transcript usage uses the final assistant message independently of streamed totals. These are raw counts, not a currency estimate.

Logs and transcripts may include source and private prompts. Choose retention separately from workspace cleanup; native transcript capture and logging are independent options.

Workflow usage budgets and privacy-preserving metrics are covered in [budgets](../../../workflows/budgets/) and [OpenTelemetry](../../../advanced/telemetry/).

See [retention policies and quotas](../../../operations/storage-retention/) for explicit pruning of closed journals.

## Custom handlers

`createReporter(handlers, { onError })` returns a callable observer with `flush()`. Handlers receive the narrowed `AgentObservation`, including `pass` and `at`. They run serially, accept promises and ignore unhandled kinds. Always await `flush()` before closing destinations; dispatch does not await handlers. The first handler failure is retained and rejected by every flush; later handlers continue. See the [Winston, console and file example](../../../agents/observability/#create-your-own-reporter). Plain observe callbacks remain synchronous and their returned promises are not managed.
