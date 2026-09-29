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

Renvoie les événements d’un journal dans l’ordre chronologique, en lisant son index exactement à reference.revision. Échoue avec TransportConflict si l’index a changé ou si un segment manque, et avec une erreur sur un cycle ou au-delà de maxEntries ou maxBytes.

[Exemple complet et règles détaillées](../../guide/journals/).

## Paramètres et propriétés

| Nom                   | Type                  | Présence  | Rôle                                                                                                                                        |
| --------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ReadJournalOptions`  | Requis    | Transport, révision exacte de l’index du journal et limite de parcours.                                                                     |
| `options.reference`   | `TransportReference`  | Requis    | Référence de l’index du journal, en général DispatchResult.logReference ; l’index doit encore avoir cette révision.                         |
| `options.maxEntries`  | `number \| undefined` | Optionnel | Nombre maximal d’événements à lire, 100000 par défaut ; une chaîne plus longue est refusée.                                                 |
| `options.maxBytes`    | `number \| undefined` | Optionnel | Total d’octets des segments d’événements à lire, 64 Mio par défaut ; un dépassement est refusé.                                             |
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
