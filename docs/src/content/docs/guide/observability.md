---
title: "Collect events from a whole run"
description: "Observe workflow, agent and resource activity through one observation object."
---

For a single terminal session, start with [Follow progress](../progress/). Use an observation object when several tasks and resource operations need a common execution scope. Save the named files below together and run `node observe-workflow.ts` using the [setup configuration](../setup/).

## Choose one observation entry point

Use `createObservation()` for new integrations. Add `createReporter()` for terminal progress and a `transporter` when runs must be readable later. Pass that client as `observation` to dispatches and workflows. You do not need to configure `observe`, `telemetry`, `warn`, `diagnostic` or `logging` to get started.

Specialized callbacks remain available for existing integrations and targeted diagnostics. Observation sinks receive bounded events and may lose delivery; replayable journals record a different contract, and checkpoints or queues own durable control state. Reading an observed run never authorizes recovery or replay. See [run state](../run-state/), [journals](../journals/) and [durable runs](../durable-runs/).

## Observe a whole run

Create an observation object when you want workflow, agent and resource events in one place. Add sinks that receive the events, then pass it as `observation` to your run. Each event includes its execution scope.

<!-- tabs -->

```ts title="events.ts"
import { createObservation } from "@elie-laloum/outpost/core";

export const observation = createObservation({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, event.kind);
        // Example output: 1 agent review phase
      },
    },
  ],
});
```

```ts title="review-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost/workflows";
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
import { defineWorkflow } from "@elie-laloum/outpost/workflows";
import { review } from "./review-task.ts";
import { observation } from "./events.ts";

export const result = await defineWorkflow("review", [review]).start({
  observation,
});
await observation.close();
result.unwrap();
```

The sink prints workflow transitions, sandbox and Git operations and the agent’s events, in `seq` order. `dispatch()` accepts the same `observation` option for a single task.

API reference: [Observation](../../reference/observation/).

## One object for outputs and reading

`createObservation()` composes sinks and, with `transporter`, automatically records executions started by `dispatch()` or `workflow.start()`. The engine owns tracking; the observation object starts no work. Share it between executions: each persisted execution has its own event sequence. `observation.readRun(id)` and `observation.watchRun(id)` read storage from this process or another; see [execution state](../run-state/).

Pass objects from `createReporter()`, `createCustomReporter()` or `createOpenTelemetryObserver()` directly in `sinks`. Observation borrows them: it flushes delivery but their owner still closes them. Close observation after executions, then the OpenTelemetry observer and its SDK. `await using` waits for active sessions without cancelling work. Historical callbacks and `createObservationHub()` remain compatible.

## Carry the scope into your own tasks

`defineAgentTask` and `defineIsolatedTask` attach their dispatch to the task’s scope. In a task you write with `defineTask`, pass `context.observation` to each dispatch.

```ts
import { defineTask } from "@elie-laloum/outpost/workflows";
import { dispatch } from "@elie-laloum/outpost/core";
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

## Observe decisions and selections

[Decision evaluations](../decisions/) emit lifecycle summaries with source `decision`. Routed harnesses emit `model-route` agent events identifying the effective model, selection reason and optional native confidence. Pass `observation` to `decide()` for a direct evaluation; decision tasks and harnesses propagate workflow, task, pass and subagent scopes. Full states and answers require a verbose hub. Valid decision usage is accounted synchronously, independently of sink delivery or failures.

Without a transporter, observation only distributes events in memory. With a transporter, the client also persists execution projections. Slow receivers can lose events and observer failures do not stop the run. See [delivery and failures](../observation-delivery/) before relying on a complete trace.

## Export to OpenTelemetry

Install `@opentelemetry/api` and an OpenTelemetry SDK, then register the SDK and its exporters before you create the observer. Pass the observer directly to `createObservation({ sinks })` to turn events into linked spans and metrics. The `.sink` property remains available for compatibility.

Save the three files below together and run `node observe-telemetry.ts` after registering the SDK.

<!-- tabs -->

```ts title="telemetry.ts"
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
import { trace, metrics } from "@opentelemetry/api";
import { createObservation } from "@elie-laloum/outpost/core";

export const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
export const observation = createObservation({ sinks: [telemetry] });
```

```ts title="telemetry-review.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost/workflows";
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
import { defineWorkflow } from "@elie-laloum/outpost/workflows";
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
Wire the observer once per run: passing `telemetry` and an observation client holding `telemetry` to the same run duplicates its spans and metrics.
:::

## Next steps

- [Read a run from another process](../run-state/)
- [Handle delivery failures](../observation-delivery/)
- [Mask sensitive data](../redacting-secrets/)

<span id="continue"></span>

<span id="delivery-and-failures"></span>
<span id="when-agent-output-is-too-large"></span>
<span id="handle-agent-events-asynchronously"></span>
<span id="limits"></span>

<span id="mask-secrets-before-saving-or-observing"></span>
