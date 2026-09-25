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
| `reference`   | `TransportReference`  | Required | Journal index reference from DispatchResult.logReference or inspection; determines the committed event chain to read.      |
| `maxEntries`  | `number \| undefined` | Optional | Positive maximum number of retained events to traverse, default 100,000; cycles and excess entries fail.                   |
| `maxBytes`    | `number \| undefined` | Optional | Total byte limit for journal segment payloads read into memory, default 64 MiB.                                            |
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
