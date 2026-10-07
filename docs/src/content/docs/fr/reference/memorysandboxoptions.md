---
title: "MemorySandboxOptions"
description: "MemorySandboxOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MemorySandboxOptions } from "@elie-laloum/outpost/testing";
```

## Paramètres et propriétés

| Nom        | Type                                    | Présence  | Rôle                                                                                                                                                                                                               |
| ---------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commands` | `readonly MemoryCommand[] \| undefined` | Optionnel | File ordonnée de correspondances exactes exécutable/arguments et de leurs résultats simulés, partagée entre les allocations du fournisseur. Vide par défaut ; les requêtes d’agents scriptés ne la consomment pas. |

## Signature

```ts
export interface MemorySandboxOptions {
  readonly commands?: readonly MemoryCommand[];
}
```

## Contrats associés

- [MemoryCommand](../memorycommand/)
