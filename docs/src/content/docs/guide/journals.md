---
title: "Journals"
description: "Keep a durable record of each dispatch and read its events back after the run."
---

## Record a journal

Every dispatch writes a journal by default. Pass a transport in `logging` to choose where it goes, then read it back with `readJournal()`.

```ts
import {
  createLocalTransport,
  dispatch,
  readJournal,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (result.logReference) {
  const events = await readJournal({
    transporter,
    reference: result.logReference,
  });
  console.log(events.length);
}
```

`result.logReference` points to the finished journal. Without `logging`, Outpost writes it to a local transport in `<repository>/.outpost/storage`. To keep journals elsewhere, pass another transport: see [Where data lives](../storage/) and [S3 and R2](../object-storage/).

## Choose what to record

| `logging`              | What Outpost records                               | `logReference` |
| ---------------------- | -------------------------------------------------- | -------------- |
| omitted                | A journal in `<repository>/.outpost/storage`       | Yes            |
| `{ transporter }`      | A journal in that transport                        | Yes            |
| `{ verbose: true }`    | Also raw and streamed events                       | Yes            |
| `{ replayable: true }` | Also each commit as a patch, for replay            | Yes            |
| `"stdout"`             | No journal; progress lines printed to the terminal | No             |
| `false`                | Nothing                                            | No             |

Object options combine: `{ transporter, verbose: true, replayable: true }`. A [sandbox session](../sandbox-sessions/) takes `logging` once for all its dispatches, and each `sandbox.dispatch()` can override it.

## Read a journal

`readJournal()` returns the events in the order they happened. Each entry is a plain object: the event fields with its `kind`, plus `at`, `seq`, `source`, `scope` and the dispatch `label` when you set one.

`maxEntries` (100,000 by default) and `maxBytes` (64 MiB by default) bound a read. A journal beyond either limit fails to read instead of being cut short.

```ts
import { createLocalTransport, readJournal } from "@elie-laloum/outpost";
import type { TransportReference } from "@elie-laloum/outpost";

declare const reference: TransportReference;

const events = await readJournal({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
  reference,
  maxEntries: 5_000,
  maxBytes: 8 * 1024 * 1024,
});
```

## Know what a journal contains

| Recorded                | Events                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Always                  | `dispatch-start`, the `phase` and `operation` events from preparation to cleanup, the [agent events](../progress/) (`prompt`, `text`, `tool`, `tool-result`, `usage`…), then `dispatch-finished`. |
| With `verbose: true`    | `raw` protocol lines, `text-delta`, `stderr`, `reasoning`, `tool-output`, `command-output`, `model-request` and `model-response`.                                                                 |
| With `replayable: true` | A `workspace-commits` event at the end of each sandbox dispatch.                                                                                                                                  |

`dispatch-finished` carries the `status` (`done`, `failed` or `cancelled`), `completed`, the token `usage`, the branch and commits, and the `error` code and message on failure. `operation` events carry their `durationMs`.

The [built-in harness](../harness/) emits `model-request` and `model-response` only on a verbose hub. To record full model exchanges, pass one with `verbose` logging:

```ts
import { createObservationHub, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const observation = createObservationHub({ verbose: true });
await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Describe the repository without changing it." },
  observation,
  logging: { verbose: true },
});
await observation.close();
```

## Record a run to replay it

`logging: { replayable: true }` stores each commit of the dispatch as a verified binary patch. `createReplayAgent()` then replays the journal without calling a model: see [Replay without a model](../record-replay/).

## Find the journal of a failed dispatch

A failed or cancelled dispatch still closes its journal with `dispatch-finished`, including a failure during preparation. The error carries the reference: read it with `recoveryDetails()`.

```ts
import { dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Fix the failing tests and commit the fix." },
  });
} catch (error) {
  console.error(recoveryDetails(error)?.logReference);
  throw error;
}
```

[Errors](../error-handling/) lists the other recovery details.

## Remove old journals

Journals stay in their transport until you remove them. A retention policy with the `closed-logs` scope deletes closed journals older than a given age: see [Retention and cleanup](../retention/).

## Limits

- A journal is written by an [observation hub](../observability/) receiver. It shares the hub’s bounded queue (`capacity`, `deliveryTimeoutMs`): when its transport fails or falls behind, the journal can miss events, be disabled for the rest of the run or stay open, and the failure appears in `result.observerErrors` (in `recoveryDetails(error)` when the dispatch fails). `readJournal()` then returns the events written before the failure.
- Journals hold prompts, agent messages and tool results, so they contain repository content. Store and share them like the code; `replayable` adds the patches of every commit.

API: [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/) · [ReadJournalOptions](../../reference/readjournaloptions/) · [DispatchResult](../../reference/dispatchresult/) · [recoveryDetails](../../reference/recoverydetails/) · [createObservationHub](../../reference/createobservationhub/).
