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

## Paramètres et propriétés

| Nom   | Type                                                                     | Présence | Rôle                                                                                                                                  |
| ----- | ------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `put` | `(id: string, bytes: Uint8Array, signal?: AbortSignal) => Promise<void>` | Requis   | Stocke atomiquement des octets sous un id. Accepte des octets identiques pour un id existant et rejette des octets différents.        |
| `get` | `(id: string, signal?: AbortSignal) => Promise<Uint8Array>`              | Requis   | Renvoie les octets stockés sous un id ; rejette un id absent. Le store ne vérifie pas l’intégrité : readStoredArtifact() s’en charge. |

## Signature

```ts
export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}
```
