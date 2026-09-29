---
title: "createSqliteTaskQueue"
description: "createSqliteTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSqliteTaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Ouvre ou crée une base SQLite de file à path, avec son répertoire parent, et renvoie une DurableTaskQueue. Les jobs sont pris en charge dans l’ordre d’insertion sous des baux protégés par fence, et chaque écriture est synchronisée sur disque. Appelez close() une fois les workers et producteurs arrêtés.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                                                                                   |
| ------ | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `path` | `string` | Requis   | Chemin du fichier de base SQLite, résolu depuis le répertoire courant ; le fichier et son répertoire parent sont créés s’ils manquent. |

## Retour

`Promise<DurableTaskQueue>`

## Signature

```ts
export declare function createSqliteTaskQueue(
  path: string,
): Promise<DurableTaskQueue>;
```

## Contrats associés

- [DurableTaskQueue](../durabletaskqueue/)
