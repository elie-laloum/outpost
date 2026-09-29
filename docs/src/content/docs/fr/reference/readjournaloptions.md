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
| `reference`   | `TransportReference`  | Requis    | Référence de l’index du journal, en général DispatchResult.logReference ; l’index doit encore avoir cette révision.                         |
| `maxEntries`  | `number \| undefined` | Optionnel | Nombre maximal d’événements à lire, 100000 par défaut ; une chaîne plus longue est refusée.                                                 |
| `maxBytes`    | `number \| undefined` | Optionnel | Total d’octets des segments d’événements à lire, 64 Mio par défaut ; un dépassement est refusé.                                             |
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
