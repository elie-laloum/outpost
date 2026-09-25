---
title: "readJournal"
description: "readJournal — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readJournal } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lit les événements validés d’un journal dans l’ordre chronologique depuis une révision exacte de l’index. Chaque révision de segment est vérifiée ; cycles, segments absents et dépassements de limite provoquent un échec. Un journal ouvert expose uniquement son préfixe validé.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

## Paramètres et propriétés

| Nom                   | Type                  | Présence  | Rôle                                                                                                                                        |
| --------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ReadJournalOptions`  | Requis    | Transport, révision exacte de l’index du journal et limite de parcours.                                                                     |
| `options.reference`   | `TransportReference`  | Requis    | Référence de l’index issue de DispatchResult.logReference ou de l’inspection ; détermine la chaîne d’événements validés à lire.             |
| `options.maxEntries`  | `number \| undefined` | Optionnel | Nombre maximal positif d’événements à parcourir, 100 000 par défaut ; cycles et dépassements provoquent un échec.                           |
| `options.maxBytes`    | `number \| undefined` | Optionnel | Limite totale des contenus de segments lus en mémoire, 64 Mio par défaut.                                                                   |
| `options.transporter` | `Transport`           | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`Promise<readonly unknown[]>`

## Signature

```ts
export declare function readJournal(
  options: ReadJournalOptions,
): Promise<readonly unknown[]>;
```

## Contrats associés

- [ReadJournalOptions](../readjournaloptions/)
