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

| Name         | Type                          | Presence | Meaning                                                                                                               |
| ------------ | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `bytes`      | `Uint8Array<ArrayBufferLike>` | Required | Complete binary payload, without the adapter’s storage envelope.                                                      |
| `key`        | `string`                      | Required | Relative logical object key; slash-separated safe segments, up to 512 characters. It is not a filesystem path or URL. |
| `revision`   | `string`                      | Required | Opaque version token used for conditional writes and deletes; do not interpret it as a content digest.                |
| `size`       | `number`                      | Required | Payload size in bytes, excluding the transport envelope and backend storage overhead.                                 |
| `modifiedAt` | `string`                      | Required | ISO timestamp of the stored version, used as a retention observation.                                                 |

## Signature

```ts
export interface TransportObject extends TransportEntry {
  readonly bytes: Uint8Array;
}
```

## Related contracts

- [TransportEntry](../transportentry/)
