---
title: "readJournal"
description: "readJournal — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readJournal } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read committed journal events in chronological order from a pinned index revision. Every linked segment revision is checked; cycles, missing segments and entry-limit overruns fail. An open journal exposes only its committed prefix.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                  | Presence | Meaning                                                                                                                    |
| --------------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ReadJournalOptions`  | Required | Transport, pinned journal index revision and traversal bound.                                                              |
| `options.reference`   | `TransportReference`  | Required | Journal index reference from DispatchResult.logReference or inspection; determines the committed event chain to read.      |
| `options.maxEntries`  | `number \| undefined` | Optional | Positive maximum number of retained events to traverse, default 100,000; cycles and excess entries fail.                   |
| `options.maxBytes`    | `number \| undefined` | Optional | Total byte limit for journal segment payloads read into memory, default 64 MiB.                                            |
| `options.transporter` | `Transport`           | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`Promise<readonly unknown[]>`

## Signature

```ts
export declare function readJournal(
  options: ReadJournalOptions,
): Promise<readonly unknown[]>;
```

## Related contracts

- [ReadJournalOptions](../readjournaloptions/)
