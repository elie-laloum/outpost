---
title: "TransportReadOptions"
description: "TransportReadOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportReadOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                       | Presence | Meaning                                                                                                   |
| ---------- | -------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optional | Abort the read or listing without treating cancellation as an absent object.                              |
| `maxBytes` | `number \| undefined`      | Optional | Maximum payload bytes for one read, default 64 MiB. Listing returns metadata and does not use this limit. |

## Signature

```ts
export interface TransportReadOptions {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
```
