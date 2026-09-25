---
title: "CheckpointRecoveryOptions"
description: "CheckpointRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CheckpointRecoveryOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type        | Présence | Rôle                                                                                                                                        |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`       | `string`    | Requis   | Identité de l’exécution dont la propriété est explicitement libérée ; les valeurs du checkpoint restent intactes.                           |
| `revision`    | `string`    | Requis   | Révision observée après arrêt de l’ancien exécuteur ; une révision modifiée fait refuser la récupération.                                   |
| `transporter` | `Transport` | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface CheckpointRecoveryOptions extends TransportStoreOptions {
  readonly runId: string;
  readonly revision: string;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
