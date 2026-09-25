---
title: "sqliteTaskQueue"
description: "sqliteTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { sqliteTaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Ouvre une file de tâches SQLite durable à path. L’envoi déduplique les identités, les prises en charge créent des baux avec jeton de génération et les workers périmés ne peuvent valider l’état de file. Fermez la base renvoyée après usage ; les effets externes restent au moins une fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                      |
| ------ | -------- | -------- | ----------------------------------------- |
| `path` | `string` | Requis   | Chemin hôte de la base SQLite de la file. |

## Retour

`Promise<DurableTaskQueue>`

## Signature

```ts
export declare function sqliteTaskQueue(
  path: string,
): Promise<DurableTaskQueue>;
```

## Contrats associés

- [DurableTaskQueue](../durabletaskqueue/)
