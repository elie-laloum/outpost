---
title: "ArtifactStore"
description: "ArtifactStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactStore**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name  | Type                                                                     | Presence | Meaning                                                                 |
| ----- | ------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `put` | `(id: string, bytes: Uint8Array, signal?: AbortSignal) => Promise<void>` | Required | Publish atomically; reject conflicting bytes for an existing ID.        |
| `get` | `(id: string, signal?: AbortSignal) => Promise<Uint8Array>`              | Required | Read bounded bytes or reject missing objects; callers verify integrity. |

## Signature

```ts
export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}
```
