---
title: "Handle slow or failing observers"
description: "Check event loss and delivery errors when an observer performs asynchronous work."
---

Check event loss and delivery errors when an observer performs asynchronous work.

## Check that observer failures leave the work intact

This offline example still returns `hello` when the sink rejects every event. Run it with Node.js 24; it prints `done true`.

```ts
import assert from "node:assert/strict";
import { createObservation } from "@elie-laloum/outpost/core";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost/workflows";

const observation = createObservation({
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

`dispatch()` and `start()` drain their deliveries before they return. `observation.flush()` drains current delivery, including active persisted sessions. `observation.close()` prevents new executions, waits for active sessions without cancelling them, then closes delivery. Sinks and transports remain borrowed.

<!-- tabs -->

```ts title="slow-observer.ts"
import { createObservation } from "@elie-laloum/outpost/core";

export const observation = createObservation({
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
import { defineTask, defineWorkflow } from "@elie-laloum/outpost/workflows";
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

`createCustomReporter()` builds a sink from handlers keyed by agent event kind; it also remains callable as an `observe` callback. Handlers may be asynchronous; they run on a bounded queue like hub sinks.

```ts
import { appendFile } from "node:fs/promises";
import { createObservation, dispatch } from "@elie-laloum/outpost/core";
import { createCustomReporter } from "@elie-laloum/outpost/observation";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const report = createCustomReporter({
  async tool(event) {
    await appendFile("tools.log", `${event.at} ${event.name}\n`);
  },
});
await using observation = createObservation({ sinks: [report] });
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observation,
});
await report.flush();
```

The dispatch waits for pending handlers before it returns and reports the first handler error in `result.observerErrors`. `report.flush()` rethrows that error. The second argument takes `onError`, called for each failure, plus the hub’s `capacity` and `deliveryTimeoutMs`.

Owned run-receiver cleanup is also bounded by `deliveryTimeoutMs`. A stalled transport cannot hold the execution’s final cleanup indefinitely. Timing out does not abort a pending write on the borrowed transport; inspect observation errors and keep its owner responsible for outstanding I/O.

## Limits

- Delivery uses bounded in-memory queues. Configure `transporter` on `createObservation()` to record [run state](../run-state/), or read the dispatch’s [journal](../journals/). Both persistence paths can lose events when their sinks fall behind.
- A disabled sink stays disabled for its delivery session. Each hub bounds its error history to 100 entries; the client also retains bounded errors from completed persisted sessions.
- Persisted executions have independent delivery sessions and event sequences. The client aggregates their errors and losses. Without persistence, the shared in-memory hub retains its counters and delivery state across runs. Closed hubs ignore emitted events; closed clients refuse new executions.
- Events emitted on a remote [worker](../job-queues/) stay on that worker’s hub.

API: [Delivery options](../../reference/observationoptions/) · [Client lifecycle and counters](../../reference/observationclient/) · [Custom reporter](../../reference/createcustomreporter/).
