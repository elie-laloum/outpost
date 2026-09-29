---
title: "ObservationSink"
description: "ObservationSink — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationSink } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                  | Présence  | Rôle                                                                                                                       |
| --------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `observe` | `(observation: Observation) => void \| Promise<void>` | Requis    | Reçoit une enveloppe ; les promesses retournées sont sérialisées par récepteur et leurs rejets sont isolés de l’exécution. |
| `flush`   | `(() => void \| Promise<void>) \| undefined`          | Optionnel | Vide le tampon propre au récepteur ; le hub l’appelle depuis flush() avec son délai de livraison.                          |

## Signature

```ts
export interface ObservationSink {
  observe(observation: Observation): void | Promise<void>;
  flush?(): void | Promise<void>;
}
```

## Contrats associés

- [Observation](../observation/)
