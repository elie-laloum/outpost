---
title: "Events, logs and usage"
description: "Events, logs and usage — Outpost"
sidebar:
  order: 11
---

Use `reporter` for readable terminal output or `observe` for structured integration.

```ts
import { dispatch, codex, reporter } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: { text: "Inspect and summarize the repository." },
  label: "inspection",
  observe: reporter({ label: "inspection", verbose: false }),
  warn: console.warn,
  logging: { file: ".outpost/logs/inspection.jsonl", verbose: true },
});
console.log(result.usage, result.log);
```

## Events

`AgentObservation` adds a one-based `pass` and ISO timestamp `at` to normalized events. Kinds are `phase`, `prompt`, `text`, `result`, `tool`, `conversation`, `usage`, `summary`, `warning`, `failure`, `finished` and `raw`. Use the discriminant before reading kind-specific fields. Unknown protocol data remains available as `raw`.

Observer and warning callback exceptions do not fail the job. Do not use an observer to enforce critical business rules: validate the returned result instead. `reporter` accepts `label`, `verbose`, `quiet` and a custom `write(text)` function.

## Logging

The default is a generated JSONL file under `.outpost/logs`. Set `logging: false` to disable it, `"stdout"` for standard output, or `{ file, verbose }` for control. A dispatch can override the warm sandbox’s logging policy. Verbose logging includes raw protocol events.

A configured `logging.file` can be appended by sequential dispatches. Concurrent writers to the same path are rejected while it is owned in that repository. Default logs receive a private closed-log sidecar for retention; closing a journal is idempotent.

## Token accounting

`Usage` contains `input`, `cached` (cache read), optional `cacheCreated` (cache creation), and `output`. Each turn records `durationMs` and usage; the result aggregates turns. Claude native transcript usage uses the final assistant message independently of streamed totals. These are raw counts, not a currency estimate.

Logs and transcripts may include source and private prompts. Choose retention separately from workspace cleanup; native transcript capture and logging are independent options.

Workflow usage budgets and privacy-preserving metrics are covered in [budgets](../../../workflows/budgets/) and [OpenTelemetry](../../../advanced/telemetry/).

See [retention policies and quotas](../../../operations/storage-retention/) for explicit pruning of closed journals.

## Custom handlers

`createReporter(handlers, { onError })` returns a callable observer with `flush()`. Handlers receive the narrowed `AgentObservation`, including `pass` and `at`. They run serially, accept promises and ignore unhandled kinds. Always await `flush()` before closing destinations; dispatch does not await handlers. The first handler failure is retained and rejected by every flush; later handlers continue. See the [Winston, console and file example](../../../agents/observability/#create-your-own-reporter). Plain observe callbacks remain synchronous and their returned promises are not managed.
