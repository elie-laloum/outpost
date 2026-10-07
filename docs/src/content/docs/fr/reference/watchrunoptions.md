---
title: "WatchRunOptions"
description: "WatchRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WatchRunOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                       | Présence  | Rôle                                                                                                     |
| ------------- | -------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `from`        | `number \| undefined`      | Optionnel | Curseur persistant exclusif, 0 par défaut ; les curseurs négatifs, fractionnaires ou en avance échouent. |
| `pollMs`      | `number \| undefined`      | Optionnel | Période positive de lecture en millisecondes pendant l’exécution, 1000 par défaut.                       |
| `transporter` | `Transport`                | Requis    | Transport pointant vers le même emplacement que le récepteur d’exécution.                                |
| `id`          | `string`                   | Requis    | ID de run choisi par l’application à lire sans prendre la propriété d’exécution.                         |
| `signal`      | `AbortSignal \| undefined` | Optionnel | Annule uniquement les lectures et interrogations du suivi ; jamais l’exécution observée.                 |
| `maxBytes`    | `number \| undefined`      | Optionnel | Limite de lecture par objet en octets, 8388608 par défaut ; les fiches ou segments trop grands échouent. |

## Signature

```ts
export interface WatchRunOptions extends ReadRunOptions {
  readonly from?: number;
  readonly pollMs?: number;
}
```

## Contrats associés

- [ReadRunOptions](../readrunoptions/)
