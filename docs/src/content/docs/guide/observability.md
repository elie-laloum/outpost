---
title: "Observe runs with OpenTelemetry"
description: "Collect scoped execution events and export traces and metrics."
---

## Observe a whole run

Create an observation hub when you want workflow, agent and resource events in one place. Add sinks that receive the events, then pass the hub as `observation` to your run. Each event includes its execution scope.

<!-- tabs -->

```ts title="events.ts"
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, event.kind);
      },
    },
  ],
});
```

```ts title="review-task.ts"
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

```ts title="observe-workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./review-task.ts";
import { observation } from "./events.ts";

export const result = await defineWorkflow("review", [review]).start({
  observation,
});
await observation.close();
result.unwrap();
```

The sink prints workflow transitions, sandbox and Git operations and the agent’s events, in `seq` order. `dispatch()` accepts the same `observation` option for a single task.

The event envelope includes the context of the run.

API reference: [Observation](../../reference/observation/).

## Carry the scope into your own tasks

`defineAgentTask` and `defineIsolatedTask` attach their dispatch to the task’s scope. In a task you write with `defineTask`, pass `context.observation` to each dispatch.

```ts
import { defineTask, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const audit = defineTask({
  key: "audit",
  perform: async (context) => {
    const result = await dispatch({
      repository,
      sandboxProvider,
      agent: coder,
      brief: { text: "List outdated dependencies without changing files." },
      signal: context.signal,
      ...(context.observation ? { observation: context.observation } : {}),
    });
    return result.text;
  },
});
```

Without it, the dispatch still reports to its own `observe`, but its events never reach the hub. `observation.child(scope, sinks)` derives a hub that adds scope fields; sinks passed to a child receive only the events emitted below it.

[Speculation](../speculation/) takes the same `observation` option, and the [recovery](../recovery/) and [retention](../retention/) helpers accept a hub as their last argument.

## What the hub receives

The hub receives agent activity alongside workflow transitions and resource operations.

API reference: [ObservationEvent](../../reference/observationevent/).

An `operation` event pairs `started` with `finished` or `failed` through its `id`. Only the terminal event carries `durationMs`.

### Built-in harness events

The [built-in harness](../harness/) reports its loop with these kinds. They also reach `observe`.

API reference: [AgentEvent](../../reference/agentevent/).

`tool-result` keeps only a 2,000-character `preview` of a result; subscribe to `tool-output` for the full stream.

:::caution
`model-request`, `model-response` and `tool-output` can contain repository content and secrets the agent read. Keep them out of public logs.
:::

## Delivery and failures

A sink that returns nothing runs during emission, so keep it fast. A sink that returns a promise gets its own ordered queue. An optional `flush()` on the sink runs whenever the hub drains.

| Situation                                                     | What happens                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A sink queue already holds `capacity` events (default 1,024). | New events for that sink are dropped and `dropped` increases.                   |
| A delivery exceeds `deliveryTimeoutMs` (default 5,000).       | The sink is disabled. Its pending promise keeps running.                        |
| A sink throws or rejects.                                     | The error joins `errors` and the run’s `observerErrors`. The run is unaffected. |

`dispatch()` and `start()` drain their deliveries before they return. `flush()` drains the hub at any time; `close()` drains it and stops accepting events.

<!-- tabs -->

```ts title="slow-observer.ts"
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  deliveryTimeoutMs: 2_000,
  sinks: [
    {
      async observe({ seq, event }) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        console.log(seq, event.kind);
      },
    },
  ],
});
```

```ts title="delivery.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { observation } from "./slow-observer.ts";

export const greet = defineTask({ key: "greet", perform: () => "hello" });
export const result = await defineWorkflow("greet", [greet]).start({
  observation,
});
await observation.close();
console.log(result.status, observation.dropped, observation.errors.length);
```

<!-- check:run -->

The sink prints the numbered `workflow` events, then the script prints `done 0 0`. Check `dropped` and `errors` before treating a trace as complete.

## When agent output is too large

A single protocol line above 16 MiB stops a CLI agent. The hub and `observe` receive a `raw` event holding its first 2,000 characters, with `bytes` and `truncated: true`, then `stopped` with reason `oversized-event`. The dispatch fails with code `process` ([Errors](../error-handling/)).

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

## Handle agent events asynchronously

`createCustomReporter()` builds an `observe` callback from handlers keyed by event kind. Handlers may be asynchronous; they run on a bounded queue like hub sinks.

```ts
import { appendFile } from "node:fs/promises";
import { createCustomReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const report = createCustomReporter({
  async tool(event) {
    await appendFile("tools.log", `${event.at} ${event.name}\n`);
  },
});
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: report,
});
await report.flush();
```

The dispatch waits for pending handlers before it returns and reports the first handler error in `result.observerErrors`. `report.flush()` rethrows that error. The second argument takes `onError`, called for each failure, plus the hub’s `capacity` and `deliveryTimeoutMs`.

## Limits

- The hub is a live, in-memory stream: it stores nothing, and a slow sink loses events. To read events after the run, use the dispatch’s [journal](../journals/), itself a sink with the same `capacity` and `deliveryTimeoutMs` bounds.
- A disabled sink stays disabled for the hub’s lifetime, and `errors` keeps the first 100 errors.
- A closed hub ignores new events. A hub reused across runs keeps its `errors` and `dropped` count, so each run’s `observerErrors` includes earlier errors.
- Events emitted on a remote [worker](../job-queues/) stay on that worker’s hub.

API: [createObservationHub](../../reference/createobservationhub/) · [ObservationHub](../../reference/observationhub/) · [Observation](../../reference/observation/) · [ObservationEvent](../../reference/observationevent/) · [OperationEvent](../../reference/operationevent/) · [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/) · [OpenTelemetryObserver](../../reference/opentelemetryobserver/) · [createCustomReporter](../../reference/createcustomreporter/).
