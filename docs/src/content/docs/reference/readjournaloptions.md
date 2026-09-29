---
title: "ReadJournalOptions"
description: "ReadJournalOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReadJournalOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                                                                                                    |
| ------------- | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `reference`   | `TransportReference`  | Required | Journal index reference, usually DispatchResult.logReference; the index must still have this revision.                     |
| `maxEntries`  | `number \| undefined` | Optional | Most events to read, default 100000; a longer chain rejects.                                                               |
| `maxBytes`    | `number \| undefined` | Optional | Total bytes of event segments to read, default 64 MiB; exceeding it rejects.                                               |
| `transporter` | `Transport`           | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Signature

```ts
export interface ReadJournalOptions extends TransportStoreOptions {
  readonly reference: TransportReference;
  readonly maxEntries?: number;
  readonly maxBytes?: number;
}
```

## Related contracts

- [TransportReference](../transportreference/)
- [TransportStoreOptions](../transportstoreoptions/)
