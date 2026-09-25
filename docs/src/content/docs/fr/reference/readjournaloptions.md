---
title: "ReadJournalOptions"
description: "ReadJournalOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReadJournalOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                        |
| ------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference`   | `TransportReference`  | Requis    | Référence de l’index issue de DispatchResult.logReference ou de l’inspection ; détermine la chaîne d’événements validés à lire.             |
| `maxEntries`  | `number \| undefined` | Optionnel | Nombre maximal positif d’événements à parcourir, 100 000 par défaut ; cycles et dépassements provoquent un échec.                           |
| `maxBytes`    | `number \| undefined` | Optionnel | Limite totale des contenus de segments lus en mémoire, 64 Mio par défaut.                                                                   |
| `transporter` | `Transport`           | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface ReadJournalOptions extends TransportStoreOptions {
  readonly reference: TransportReference;
  readonly maxEntries?: number;
  readonly maxBytes?: number;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
- [TransportStoreOptions](../transportstoreoptions/)
