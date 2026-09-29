---
title: "TransportObject"
description: "TransportObject — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportObject } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                          | Presence | Meaning                                                                                                                                         |
| ------------ | ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `bytes`      | `Uint8Array<ArrayBufferLike>` | Required | Complete binary payload, without the adapter’s storage envelope.                                                                                |
| `key`        | `string`                      | Required | Logical key: /-separated segments of letters, digits, ., _ and -, none starting with a dot, up to 512 characters. It is not a file path or URL. |
| `revision`   | `string`                      | Required | Opaque token of this version, passed as ifRevision to replace or remove it. It changes on every write and is not a content digest.              |
| `size`       | `number`                      | Required | Payload size in bytes, excluding the transport envelope and backend storage overhead.                                                           |
| `modifiedAt` | `string`                      | Required | ISO timestamp of the stored version; retention computes object age from it.                                                                     |

## Signature

```ts
export interface TransportObject extends TransportEntry {
  readonly bytes: Uint8Array;
}
```

## Related contracts

- [TransportEntry](../transportentry/)
