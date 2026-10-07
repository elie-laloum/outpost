---
title: "readRun"
description: "readRun — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readRun } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lit et valide une fiche publiée atomiquement sans verrou d’exécution. Renvoie undefined pour un ID absent. Déduit abandoned et complete false si le heartbeat d’une exécution en cours expire, sans persister ce statut ni modifier la propriété des ressources. Les observations peuvent être retardées ou perdues ; cette fiche n’est pas un checkpoint.

[Exemple complet et règles détaillées](../../guide/run-state/).

## Paramètres et propriétés

| Nom                   | Type                       | Présence  | Rôle                                                                                                     |
| --------------------- | -------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `options`             | `ReadRunOptions`           | Requis    | Transport et ID d’exécution avec annulation et limite d’octets par objet optionnelles.                   |
| `options.transporter` | `Transport`                | Requis    | Transport pointant vers le même emplacement que le récepteur d’exécution.                                |
| `options.id`          | `string`                   | Requis    | ID de run choisi par l’application à lire sans prendre la propriété d’exécution.                         |
| `options.signal`      | `AbortSignal \| undefined` | Optionnel | Annule uniquement les lectures et interrogations du suivi ; jamais l’exécution observée.                 |
| `options.maxBytes`    | `number \| undefined`      | Optionnel | Limite de lecture par objet en octets, 8388608 par défaut ; les fiches ou segments trop grands échouent. |

## Retour

`Promise<RunSnapshot | undefined>`

## Signature

```ts
export declare function readRun(
  options: ReadRunOptions,
): Promise<RunSnapshot | undefined>;
```

## Contrats associés

- [ReadRunOptions](../readrunoptions/)
- [RunSnapshot](../runsnapshot/)
