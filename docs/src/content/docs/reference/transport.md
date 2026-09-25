---
title: "Transport"
description: "Transport — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Transport } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                                                                          | Presence | Meaning                                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                                                      | Required | Diagnostic adapter name; callers must use the transport contract rather than branch on this name.                                                                                       |
| `read`   | `(key: string, options?: TransportReadOptions) => Promise<TransportObject \| undefined>`      | Required | Read one complete object with a byte limit; return undefined only when it is absent. Revisions identify the exact bytes read.                                                           |
| `write`  | `(key: string, bytes: Uint8Array, options: TransportWriteOptions) => Promise<TransportEntry>` | Required | Atomically publish up to 64 MiB only when the expected revision matches, or create when ifRevision is null. Every successful write returns a fresh revision, including identical bytes. |
| `remove` | `(key: string, options: TransportWriteOptions) => Promise<void>`                              | Required | Delete only the supplied existing revision; null is invalid. A conflict must never remove a replacement written by another owner.                                                       |
| `list`   | `(prefix?: string, options?: TransportReadOptions) => AsyncIterable<TransportEntry>`          | Required | Iterate metadata for keys beginning with the prefix, handling backend pagination. A listing is an observation, not a transaction across objects.                                        |

## Signature

```ts
export interface Transport {
  readonly name: string;
  read(
    key: string,
    options?: TransportReadOptions,
  ): Promise<TransportObject | undefined>;
  write(
    key: string,
    bytes: Uint8Array,
    options: TransportWriteOptions,
  ): Promise<TransportEntry>;
  remove(key: string, options: TransportWriteOptions): Promise<void>;
  list(
    prefix?: string,
    options?: TransportReadOptions,
  ): AsyncIterable<TransportEntry>;
}
```

## Related contracts

- [TransportEntry](../transportentry/)
- [TransportObject](../transportobject/)
- [TransportReadOptions](../transportreadoptions/)
- [TransportWriteOptions](../transportwriteoptions/)
