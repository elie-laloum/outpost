---
title: "httpTaskQueue"
description: "httpTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { httpTaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un client TaskQueue pour l’endpoint HTTP et le jeton bearer fournis. Chaque requête est soumise à timeoutMs ; ce client transporte les opérations de file sans exécuter de gestionnaire localement.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                              |
| ------------------- | --------------------- | --------- | ----------------------------------------------------------------- |
| `options`           | `QueueClientOptions`  | Requis    | URL d’endpoint de file, jeton bearer et délai des requêtes.       |
| `options.url`       | `string`              | Requis    | URL HTTP de base du serveur de file de tâches.                    |
| `options.token`     | `string`              | Requis    | Identifiant de transport explicite ; jamais dans une URL.         |
| `options.timeoutMs` | `number \| undefined` | Optionnel | Durée maximale en millisecondes de chaque requête HTTP à la file. |

## Retour

`TaskQueue`

## Signature

```ts
export declare function httpTaskQueue(options: QueueClientOptions): TaskQueue;
```

## Contrats associés

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
