---
title: "Export traces and metrics"
description: "Connect an observation hub to your OpenTelemetry instrumentation."
---

Use this guide after [collecting scoped events](../observability/) when you need traces in your existing telemetry backend. Prepare the [agent configuration](../setup/) and an OpenTelemetry SDK with an exporter for that backend. Save the three files below together and run `node observe-telemetry.ts` after registering the SDK.

## Export to OpenTelemetry

Install `@opentelemetry/api` and an OpenTelemetry SDK, then register the SDK and its exporters before you create the observer. Its `sink` turns hub events into linked spans and metrics.

<!-- tabs -->

```ts title="telemetry.ts"
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
import { trace, metrics } from "@opentelemetry/api";
import { createObservationHub } from "@elie-laloum/outpost";

export const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
export const observation = createObservationHub({ sinks: [telemetry.sink] });
```

```ts title="telemetry-review.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
```

```ts title="observe-telemetry.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./telemetry-review.ts";
import { observation, telemetry } from "./telemetry.ts";

await defineWorkflow("review", [review]).start({ observation });
await observation.close();
telemetry.close();
```

The trace nests `outpost.workflow`, `outpost.task`, `outpost.task.attempt` and `outpost.dispatch` spans, with one span per operation such as `outpost.sandbox.acquire`. Without a registered SDK, the API handles export nothing.

API reference: [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/).

`telemetry.close()` ends the spans still open. Your application flushes and shuts down the SDK. Pass `onError` to receive instrumentation errors; they never change a run’s outcome.

### Without a hub

Pass the observer as `telemetry` to `start()` for workflow, task and attempt spans, or to `dispatch()` for a dispatch span. Operation spans need the hub.

:::caution
Wire the observer once per run: passing `telemetry` and a hub holding `telemetry.sink` to the same run duplicates its spans and metrics.
:::
