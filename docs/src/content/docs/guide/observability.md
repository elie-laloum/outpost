---
title: "Collect events from a whole run"
description: "Observe workflow, agent and resource activity through one hub."
---

For a single terminal session, start with [Follow progress](../progress/). Use a hub when several tasks and resource operations need a common execution scope. Save the named files below together and run `node observe-workflow.ts` using the [setup configuration](../setup/).

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
        // Example output: 1 agent review phase
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

## Observe decisions and selections

[Decision evaluations](../decisions/) emit lifecycle summaries with source `decision`. Routed harnesses emit `model-route` agent events identifying the effective model, selection reason and optional native confidence. Pass `observation` to `decide()` for a direct evaluation; decision tasks and harnesses propagate workflow, task, pass and subagent scopes. Full states and answers require a verbose hub. Valid decision usage is accounted synchronously, independently of sink delivery or failures.

A hub is an in-memory event stream, not durable storage. Slow receivers can lose events and observer failures do not stop the run. See [delivery and failures](../observation-delivery/) before relying on a complete trace.

## Next steps

- [Export traces and metrics](../opentelemetry/)
- [Read a run from another process](../run-state/)

<!-- Retained section anchors for existing bookmarks. -->

<span id="export-to-opentelemetry"></span>
<span id="without-a-hub"></span>

## Continue

- [Handle delivery failures](../observation-delivery/)
- [Mask sensitive data](../redacting-secrets/)

<span id="delivery-and-failures"></span>
<span id="when-agent-output-is-too-large"></span>
<span id="handle-agent-events-asynchronously"></span>
<span id="limits"></span>

<span id="mask-secrets-before-saving-or-observing"></span>
