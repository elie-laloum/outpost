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

| Name     | Type                                                                                          | Presence | Meaning                                                                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                                                      | Required | Adapter name for diagnostics: local or s3 for the built-in transports.                                                                                                                                                  |
| `read`   | `(key: string, options?: TransportReadOptions) => Promise<TransportObject \| undefined>`      | Required | Reads one complete object, or returns undefined when the key is absent. An object larger than maxBytes rejects instead of being truncated.                                                                              |
| `write`  | `(key: string, bytes: Uint8Array, options: TransportWriteOptions) => Promise<TransportEntry>` | Required | Atomically stores up to 64 MiB when ifRevision matches the current revision, or is null and the key is absent; otherwise rejects with TransportConflict. Each success returns a new revision, even for identical bytes. |
| `remove` | `(key: string, options: TransportWriteOptions) => Promise<void>`                              | Required | Deletes the object only when its current revision equals ifRevision; a missing object or another revision rejects with TransportConflict. ifRevision null is rejected.                                                  |
| `list`   | `(prefix?: string, options?: TransportReadOptions) => AsyncIterable<TransportEntry>`          | Required | Yields the metadata of every object whose key starts with prefix, across backend pages. It is not a snapshot: objects changed during the listing may or may not appear.                                                 |

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
