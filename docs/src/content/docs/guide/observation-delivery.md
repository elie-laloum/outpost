---
title: "Handle slow or failing observers"
description: "Check event loss and delivery errors when an observer performs asynchronous work."
---

Check event loss and delivery errors when an observer performs asynchronous work.

## Check that observer failures leave the work intact

This offline example still returns `hello` when the sink rejects every event. Run it with Node.js 24; it prints `done true`.

```ts
import assert from "node:assert/strict";
import {
  createObservationHub,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const observation = createObservationHub({
  sinks: [
    {
      observe() {
        throw new Error("Receiver unavailable");
      },
    },
  ],
});
const task = defineTask({ key: "greet", perform: () => "hello" });
const result = await defineWorkflow("observer-failure", [task]).start({
  observation,
});
await observation.close();
assert.equal(result.value(task), "hello");
console.log(result.status, observation.errors.length > 0);
```

<!-- check:run -->

## Delivery and failures

A sink that returns nothing runs during emission, so keep it fast. A sink that returns a promise gets its own ordered queue. An optional `flush()` on the sink runs whenever the hub drains.

| Situation                                     | What happens                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| A sink queue already holds `capacity` events. | New events for that sink are dropped and `dropped` increases.                   |
| A delivery exceeds `deliveryTimeoutMs`.       | The sink is disabled. Its pending promise keeps running.                        |
| A sink throws or rejects.                     | The error joins `errors` and the run’s `observerErrors`. The run is unaffected. |

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
        // Example output: 1 workflow
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
// Example output: done 0 0
```

<!-- check:run -->

The sink prints the numbered `workflow` events, then the script prints `done 0 0`. Check `dropped` and `errors` before treating a trace as complete.

## When agent output is too large

A single protocol line above 16 MiB stops a CLI agent. The hub and `observe` receive a `raw` event holding its first 2,000 characters, with `bytes` and `truncated: true`, then `stopped` with reason `oversized-event`. The dispatch fails with code `process` ([Errors](../error-handling/)).

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

API: [Delivery options](../../reference/observationhuboptions/) · [Hub lifecycle and counters](../../reference/observationhub/) · [Custom reporter](../../reference/createcustomreporter/).
