---
title: "watchRun"
description: "watchRun — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { watchRun } from "@elie-laloum/outpost";
```

## Rôle et comportement

Relit les segments publiés strictement après from, puis interroge la fiche tant qu’elle est en cours. Termine après livraison des événements d’une fiche terminée, suspendue ou abandonnée. Les curseurs persistent après reprise ; les heartbeats ne les avancent pas. Le signal n’annule que le lecteur. Les segments absents, fiches invalides et curseurs en avance lèvent une erreur.

[Exemple complet et règles détaillées](../../guide/run-state/).

## Paramètres et propriétés

| Nom                   | Type                       | Présence  | Rôle                                                                                                     |
| --------------------- | -------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `options`             | `WatchRunOptions`          | Requis    | Recherche du run, curseur exclusif, intervalle de lecture et annulation du lecteur optionnelle.          |
| `options.from`        | `number \| undefined`      | Optionnel | Curseur persistant exclusif, 0 par défaut ; les curseurs négatifs, fractionnaires ou en avance échouent. |
| `options.pollMs`      | `number \| undefined`      | Optionnel | Période positive de lecture en millisecondes pendant l’exécution, 1000 par défaut.                       |
| `options.transporter` | `Transport`                | Requis    | Transport pointant vers le même emplacement que le récepteur d’exécution.                                |
| `options.id`          | `string`                   | Requis    | ID de run choisi par l’application à lire sans prendre la propriété d’exécution.                         |
| `options.signal`      | `AbortSignal \| undefined` | Optionnel | Annule uniquement les lectures et interrogations du suivi ; jamais l’exécution observée.                 |
| `options.maxBytes`    | `number \| undefined`      | Optionnel | Limite de lecture par objet en octets, 8388608 par défaut ; les fiches ou segments trop grands échouent. |

## Retour

`AsyncIterable<RunEvent>`

## Signature

```ts
export declare function watchRun(
  options: WatchRunOptions,
): AsyncIterable<RunEvent>;
```

## Contrats associés

- [RunEvent](../runevent/)
- [WatchRunOptions](../watchrunoptions/)
