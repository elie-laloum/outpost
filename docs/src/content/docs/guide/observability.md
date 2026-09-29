---
title: "Observation hub and OpenTelemetry"
description: "Receive the workflow, agent and operation events of a whole run in one place, and export them as OpenTelemetry traces and metrics."
---

## Observe a whole run

`observe` follows one dispatch or one workflow ([Follow progress](../progress/)). An observation hub receives everything a run emits, each event tagged with where it came from. Create it with sinks, then pass it as `observation`.

```ts
import {
  createObservationHub,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const observation = createObservationHub({
  sinks: [
    {
      observe({ seq, source, scope, event }) {
        console.log(seq, source, scope.taskKey, event.kind);
      },
    },
  ],
});
const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
const result = await defineWorkflow("review", [review]).start({ observation });
await observation.close();
result.unwrap();
```

The sink prints workflow transitions, sandbox and Git operations and the agent’s events, in `seq` order. `dispatch()` accepts the same `observation` option for a single task.

Each sink receives an envelope:

| Field    | Holds                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| `seq`    | An order number, increasing across the hub and every scope derived from it.                                    |
| `at`     | The ISO time at which Outpost emitted the event.                                                               |
| `source` | `agent`, `harness`, `workflow`, `sandbox`, `git`, `hooks`, `transfer`, `conversation` or `recovery`.           |
| `scope`  | The known `executionId`, `taskKey`, `attempt`, `dispatchId`, `pass`, `subagentId` and speculative `candidate`. |
| `event`  | The event itself. Narrow on `event.kind`.                                                                      |

## Carry the scope into your own tasks

`defineAgentTask` and `defineIsolatedTask` attach their dispatch to the task’s scope. In a task you write with `defineTask`, pass `context.observation` to each dispatch.

```ts
import { defineTask, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

Agent events, listed in [Follow progress](../progress/), arrive with source `agent` or `harness`. The hub adds these kinds:

| `event.kind`                          | Carries                                            | Emitted when                                                                                                                                            |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operation`                           | `id`, `name`, `status`, `durationMs`               | A step starts, then finishes or fails: workspace and lock, sandbox acquire and release, agent authentication, hooks, transfers, conversations, cleanup. |
| `dispatch-start`, `dispatch-finished` | `status`, `completed`, `commits`, `usage`, `error` | A dispatch starts; it finishes after its cleanup, including on failure.                                                                                 |
| `workflow`                            | `event`, a workflow event                          | The run, a task, a cache lookup, a loop round, a gate or a budget changes state ([Follow progress](../progress/)).                                      |
| `command-output`                      | `channel`, `text`                                  | A `defineCommandTask` command writes to stdout or stderr.                                                                                               |
| `candidate`                           | `status`                                           | [Speculation](../speculation/) validates, accepts, rejects or cleans up a candidate.                                                                    |
| `queue`                               | `id`, `status`                                     | A [queued task](../job-queues/) is enqueued, polled, completed or failed.                                                                               |
| `workspace-commits`                   | `baseline`, `commits`                              | A replayable journal records the agent’s commits ([Replay without a model](../record-replay/)).                                                         |

An `operation` event pairs `started` with `finished` or `failed` through its `id`. Only the terminal event carries `durationMs`.

### Built-in harness events

The [built-in harness](../harness/) reports its loop with these kinds. They also reach `observe`.

| `event.kind`                      | Emitted when                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `step`                            | A new model step starts.                                                                    |
| `subagent`                        | A [subagent](../subagents/) starts, finishes or fails; its events carry `scope.subagentId`. |
| `tool-denied`                     | A [permission or hook](../harness-permissions/) refuses a tool call; `reason` says why.     |
| `stop-prevented`                  | A stop hook sends the model back to work with `message`.                                    |
| `compaction`                      | The history is compacted; `strategy` and `messages` describe it.                            |
| `skills-loaded`                   | [Skills](../harness-context/) are loaded; `names` lists them.                               |
| `tool-output`                     | A tool’s sandbox command writes to stdout or stderr, in chunks of up to 8,192 characters.   |
| `model-request`, `model-response` | The model is called. Emitted only when the hub was created with `verbose: true`.            |

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

```ts
import {
  createObservationHub,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const observation = createObservationHub({
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
const greet = defineTask({ key: "greet", perform: () => "hello" });
const result = await defineWorkflow("greet", [greet]).start({ observation });
await observation.close();
console.log(result.status, observation.dropped, observation.errors.length);
```

<!-- check:run -->

The sink prints the numbered `workflow` events, then the script prints `done 0 0`. Check `dropped` and `errors` before treating a trace as complete.

## When agent output is too large

A single protocol line above 16 MiB stops a CLI agent. The hub and `observe` receive a `raw` event holding its first 2,000 characters, with `bytes` and `truncated: true`, then `stopped` with reason `oversized-event`. The dispatch fails with code `process` ([Errors](../error-handling/)).

## Export to OpenTelemetry

Install `@opentelemetry/api` and an OpenTelemetry SDK, then register the SDK and its exporters before you create the observer. Its `sink` turns hub events into linked spans and metrics.

```ts
import { metrics, trace } from "@opentelemetry/api";
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
import {
  createObservationHub,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const telemetry = createOpenTelemetryObserver({
  tracer: trace.getTracer("outpost"),
  meter: metrics.getMeter("outpost"),
});
const observation = createObservationHub({ sinks: [telemetry.sink] });
const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Review the public API without modifying files." },
  }),
});
await defineWorkflow("review", [review]).start({ observation });
await observation.close();
telemetry.close();
```

The trace nests `outpost.workflow`, `outpost.task`, `outpost.task.attempt` and `outpost.dispatch` spans, with one span per operation such as `outpost.sandbox.acquire`. Without a registered SDK, the API handles export nothing.

| Metric                                                                                                             | Measures                                                  |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `outpost.workflow.executions`, `outpost.task.executions`, `outpost.dispatch.executions`                            | Finished runs, tasks and dispatches, by `outpost.status`. |
| `outpost.task.attempts`, `outpost.task.retries`                                                                    | Started attempts and retries.                             |
| `outpost.workflow.duration`, `outpost.task.duration`, `outpost.task.attempt.duration`, `outpost.dispatch.duration` | Durations in seconds, by `outpost.status`.                |
| `outpost.agent.tokens`, `outpost.dispatch.tokens`                                                                  | Tokens, by `outpost.token.type`.                          |

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
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

- The hub is a live, in-memory stream: it stores nothing, and a slow sink loses events. To read events after the run, use the dispatch’s [journal](../journals/).
- A disabled sink stays disabled for the hub’s lifetime, and `errors` keeps the first 100 errors.
- A closed hub ignores new events. A hub reused across runs keeps its `errors` and `dropped` count, so each run’s `observerErrors` includes earlier errors.
- Events emitted on a remote [worker](../job-queues/) stay on that worker’s hub.

API: [createObservationHub](../../reference/createobservationhub/) · [ObservationHub](../../reference/observationhub/) · [Observation](../../reference/observation/) · [ObservationEvent](../../reference/observationevent/) · [OperationEvent](../../reference/operationevent/) · [createOpenTelemetryObserver](../../reference/createopentelemetryobserver/) · [OpenTelemetryObserver](../../reference/opentelemetryobserver/) · [createCustomReporter](../../reference/createcustomreporter/).
