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

Return a journal’s events in chronological order, reading its index at exactly reference.revision. Rejects with TransportConflict when the index has moved or a segment is missing, and with an error on a cycle or when maxEntries or maxBytes is exceeded.

[Complete example and detailed rules](../../guide/journals/).

## Parameters and properties

| Name                  | Type                  | Presence | Meaning                                                                                                                    |
| --------------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ReadJournalOptions`  | Required | Transport, pinned journal index revision and traversal bound.                                                              |
| `options.reference`   | `TransportReference`  | Required | Journal index reference, usually DispatchResult.logReference; the index must still have this revision.                     |
| `options.maxEntries`  | `number \| undefined` | Optional | Most events to read, default 100000; a longer chain rejects.                                                               |
| `options.maxBytes`    | `number \| undefined` | Optional | Total bytes of event segments to read, default 64 MiB; exceeding it rejects.                                               |
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
