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

| Name  | Type                                                                     | Presence | Meaning                                                                                         |
| ----- | ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| `put` | `(id: string, bytes: Uint8Array, signal?: AbortSignal) => Promise<void>` | Required | Publish bytes atomically under an ID; reject conflicting bytes for an existing ID.              |
| `get` | `(id: string, signal?: AbortSignal) => Promise<Uint8Array>`              | Required | Read bounded artifact bytes by ID; reject a missing object. Integrity is checked by the caller. |

## Signature

```ts
export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}
```
