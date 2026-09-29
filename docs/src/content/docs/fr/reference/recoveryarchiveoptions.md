---
title: "RecoveryArchiveOptions"
description: "RecoveryArchiveOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryArchiveOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                        |
| ------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string`              | Requis    | Transfert existant contenant state.json, checksums.json et les patches, bundles et fichiers supplémentaires requis.                         |
| `maxBytes`    | `number \| undefined` | Optionnel | Limite totale des contenus, 1 Gio par défaut ; s’applique au snapshot local et à l’envoi.                                                   |
| `transporter` | `Transport`           | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface RecoveryArchiveOptions extends TransportStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
