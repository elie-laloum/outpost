---
title: "createHttpTaskQueue"
description: "createHttpTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHttpTaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un client TaskQueue avec jeton bearer fixe ou source résolue à chaque requête. timeoutMs borne l’échange HTTP après résolution du jeton ; les callbacks doivent répondre rapidement. Le client n’exécute jamais les handlers localement.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom                 | Type                                          | Présence  | Rôle                                                                                                                         |
| ------------------- | --------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `QueueClientOptions`                          | Requis    | URL d’endpoint de file, jeton bearer et délai des requêtes.                                                                  |
| `options.url`       | `string`                                      | Requis    | URL HTTP de base du serveur de file de tâches.                                                                               |
| `options.token`     | `string \| (() => string \| Promise<string>)` | Requis    | Jeton bearer fixe ou callback résolvant le jeton courant à chaque requête, y compris renouvellement du bail et finalisation. |
| `options.timeoutMs` | `number \| undefined`                         | Optionnel | Durée maximale en millisecondes de chaque requête HTTP à la file.                                                            |

## Retour

`TaskQueue`

## Signature

```ts
export declare function createHttpTaskQueue(
  options: QueueClientOptions,
): TaskQueue;
```

## Contrats associés

- [QueueClientOptions](../queueclientoptions/)
- [TaskQueue](../taskqueue/)
