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

| Name       | Type                       | Presence | Meaning                                                                                     |
| ---------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optional | Aborts the read or listing; the call rejects instead of returning undefined.                |
| `maxBytes` | `number \| undefined`      | Optional | Largest payload a read accepts, default 64 MiB; a larger object rejects. list() ignores it. |

## Signature

```ts
export interface TransportReadOptions {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
```
