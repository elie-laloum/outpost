---
title: "ArtifactStore"
description: "ArtifactStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactStore**. See the [typed artifacts guide](../../workflows/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactStore } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}
```
