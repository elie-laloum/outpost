---
title: "Logs and traces"
description: "Read committed execution events and instrument the runtime."
---

Use dispatch journals for durable execution records, progress observers for live display, and telemetry for instrumentation.

```ts
import { dispatch, localTransport, readJournal } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = localTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  console.log(
    await readJournal({ transporter, reference: result.logReference }),
  );
}
```

## Journal options

`logging: false` disables journaling. `"stdout"` selects stdout logging. An object selects a transport and optional `verbose` raw-event retention. The returned `logReference` pins the journal index revision; `readJournal()` verifies linked segments and returns committed events in order.

An open journal exposes its committed prefix. `maxEntries` and `maxBytes` bound reads. Logs and transcripts can contain private repository content, so store and share them deliberately.

## Telemetry

Install `@opentelemetry/api` and import the adapter through `@elie-laloum/outpost/opentelemetry`. Workflow `telemetry` measures graph execution; dispatch `telemetry` measures preparation, agent execution, synchronization and cleanup. They are separate instrumentation boundaries.

```ts
import { trace, metrics } from "@opentelemetry/api";
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";

const telemetry = openTelemetry({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
```

Register your OpenTelemetry SDK and exporters before creating these handles, then pass `telemetry` to the workflow or dispatch options. Without a registered SDK, these API handles do not export data.

The application owns tracer/meter provider shutdown. Instrumentation failures are isolated from execution outcomes. Custom reporting is available through `createReporter()`.

API: [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [DispatchTelemetry](../../reference/dispatchtelemetry/) · [createReporter](../../reference/createreporter/).
