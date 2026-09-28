---
title: "TaskCacheStoreOptions"
description: "TaskCacheStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheStoreOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                        |
| ------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxBytes`    | `number \| undefined` | Optionnel | Taille maximale positive d’une entrée sérialisée en octets, 16 Mio par défaut ; appliquée à l’écriture et à la lecture.                     |
| `transporter` | `Transport`           | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface TaskCacheStoreOptions extends TransportStoreOptions {
  readonly maxBytes?: number;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
