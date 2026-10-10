---
title: "Read execution journals"
description: "Record agent events and read the journal of a completed or failed dispatch."
---

Use a journal when the terminal output is no longer enough to investigate a run. Keep its `logReference` with the result or error. For a document to share with a reviewer, use a [run report](../run-reports/) instead.

## Record a journal

Each dispatch records its events in a journal by default. Set `logging.transporter` to choose its storage location, then use `readJournal()` to inspect the recorded events after the run.

<!-- tabs -->

```ts title="record-journal.ts"
import { writeFile } from "node:fs/promises";
import { createLocalTransport, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/journal-review" },
  brief: { text: "Describe the repository without changing it." },
  logging: { transporter },
});
if (!result.logReference) throw new Error("No journal was recorded");
await writeFile("journal-reference.json", JSON.stringify(result.logReference));
```

```ts title="read-journal.ts"
import { readFile } from "node:fs/promises";
import { createLocalTransport, readJournal } from "@elie-laloum/outpost";

const reference = JSON.parse(await readFile("journal-reference.json", "utf8"));
const events = await readJournal({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
  reference,
});
console.log(events.length);
```

Run `node record-journal.ts` once, then `node read-journal.ts` from the same directory. The second script prints the number of saved events without starting an agent. Keep the reference file with its storage.

`result.logReference` points to the finished journal. Without `logging`, Outpost writes it to a local transport in `<repository>/.outpost/storage`. To keep journals elsewhere, pass another transport: see [Where data lives](../storage/) and [S3 and R2](../object-storage/).

## Choose what to record

API reference: [Logging](../../reference/logging/).

Object options combine: `{ transporter, verbose: true, replayable: true }`. A [sandbox session](../sandbox-sessions/) takes `logging` once for all its dispatches, and each `sandbox.dispatch()` can override it.

## Read a journal

`readJournal()` returns the events in the order they happened. Each entry is a plain object: the event fields with its `kind`, plus `at`, `seq`, `source`, `scope` and the dispatch `label` when you set one.

API reference: [ReadJournalOptions](../../reference/readjournaloptions/).

Reading fails if the journal exceeds the configured limits; it does not return a truncated transcript.

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

## Understand recorded events

API reference: [ObservationEvent](../../reference/observationevent/) and [AgentObservation](../../reference/agentobservation/).

`dispatch-finished` carries the `status` (`done`, `failed` or `cancelled`), `completed`, the token `usage`, the branch and commits, and the `error` code and message on failure. `operation` events carry their `durationMs`.

The [built-in harness](../harness/) emits `model-request` and `model-response` only on a verbose hub. To record full model exchanges, pass one with `verbose` logging:

```ts
import { createObservationHub, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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
