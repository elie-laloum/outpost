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

| Nom   | Type                                                                     | Présence | Rôle                                                                                                                |
| ----- | ------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `put` | `(id: string, bytes: Uint8Array, signal?: AbortSignal) => Promise<void>` | Requis   | Publie atomiquement des octets sous un identifiant ; rejette des octets différents pour un identifiant existant.    |
| `get` | `(id: string, signal?: AbortSignal) => Promise<Uint8Array>`              | Requis   | Lit les octets bornés d’un artefact par identifiant ; échoue si l’objet est absent. L’appelant vérifie l’intégrité. |

## Signature

```ts
export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}
```
