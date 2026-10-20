---
title: "ObservationWatchOptions"
description: "ObservationWatchOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationWatchOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                       | Présence  | Rôle                                                                                                     |
| ---------- | -------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optionnel | Annule uniquement les lectures et interrogations du suivi ; jamais l’exécution observée.                 |
| `maxBytes` | `number \| undefined`      | Optionnel | Limite de lecture par objet en octets, 8388608 par défaut ; les fiches ou segments trop grands échouent. |
| `from`     | `number \| undefined`      | Optionnel | Curseur persistant exclusif, 0 par défaut ; les curseurs négatifs, fractionnaires ou en avance échouent. |
| `pollMs`   | `number \| undefined`      | Optionnel | Période positive de lecture en millisecondes pendant l’exécution, 1000 par défaut.                       |

## Signature

```ts
export interface ObservationWatchOptions extends Omit<
  WatchRunOptions,
  "transporter" | "id"
> {}
```

## Contrats associés

- [WatchRunOptions](../watchrunoptions/)
