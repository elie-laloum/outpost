---
title: "RunObserver"
description: "RunObserver — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunObserver } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                                                                                  |
| ----------------------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `errors`                | `readonly unknown[]`                                  | Requis    | Première erreur du récepteur, y compris de heartbeat ou stockage asynchrone ; indépendante du résultat d’exécution.                   |
| `close`                 | `() => Promise<void>`                                 | Requis    | Arrête les heartbeats et attend les écritures ; idempotente, relance l’erreur conservée et n’invente pas de statut final d’exécution. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                 | Requis    | Ferme le récepteur à la sortie d’un bloc await using.                                                                                 |
| `observe`               | `(observation: Observation) => void \| Promise<void>` | Requis    | Reçoit une enveloppe ; les promesses retournées sont sérialisées par récepteur et leurs rejets sont isolés de l’exécution.            |
| `flush`                 | `(() => void \| Promise<void>) \| undefined`          | Optionnel | Vide le tampon propre au récepteur ; le hub l’appelle depuis flush() avec son délai de livraison.                                     |

## Signature

```ts
export interface RunObserver extends ObservationSink {
  readonly errors: readonly unknown[];
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Contrats associés

- [ObservationSink](../observationsink/)
