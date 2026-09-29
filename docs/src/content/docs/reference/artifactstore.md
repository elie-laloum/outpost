---
title: "ArtifactStore"
description: "ArtifactStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactStore } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name  | Type                                                                     | Presence | Meaning                                                                                                                    |
| ----- | ------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `put` | `(id: string, bytes: Uint8Array, signal?: AbortSignal) => Promise<void>` | Required | Store bytes under an id atomically. Accepts identical bytes for an existing id and rejects different ones.                 |
| `get` | `(id: string, signal?: AbortSignal) => Promise<Uint8Array>`              | Required | Return the bytes stored under an id; rejects a missing id. The store does not verify integrity: readStoredArtifact() does. |

## Signature

```ts
export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}
```
