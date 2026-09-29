---
title: "TransportWriteOptions"
description: "TransportWriteOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportWriteOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                       | Presence | Meaning                                                                                                                                               |
| ------------ | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optional | Abort a mutation. A network interruption can leave its outcome uncertain; reread before deciding to retry.                                            |
| `ifRevision` | `string \| null`           | Required | Revision the object must currently have, or null to require that the key is absent. A mismatch rejects with TransportConflict; remove() rejects null. |

## Signature

```ts
export interface TransportWriteOptions {
  readonly signal?: AbortSignal;
  readonly ifRevision: string | null;
}
```
