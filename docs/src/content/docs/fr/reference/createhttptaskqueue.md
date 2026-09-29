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

Renvoie un client TaskQueue qui envoie chaque opération à un serveur serveTaskQueue() avec un jeton bearer, fixe ou résolu avant chaque requête. Une requête refusée rejette avec Queue request rejected (&lt;status>) et les redirections ne sont pas suivies. Le client ne garde aucune connexion à fermer.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom                 | Type                                          | Présence  | Rôle                                                                                                                                                                                                                  |
| ------------------- | --------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `QueueClientOptions`                          | Requis    | URL du serveur, jeton bearer et délai par requête.                                                                                                                                                                    |
| `options.url`       | `string`                                      | Requis    | URL de base d’un serveur serveTaskQueue(), en http ou https, sans identifiants, requête ni fragment ; les requêtes partent vers &lt;url>/queue.                                                                       |
| `options.token`     | `string \| (() => string \| Promise<string>)` | Requis    | Jeton bearer, ou fonction appelée avant chaque requête, renouvellements de bail et finalisations compris, pour qu’un jeton renouvelé s’applique aussitôt. Chaque valeur doit compter 32 à 512 caractères sans espace. |
| `options.timeoutMs` | `number \| undefined`                         | Optionnel | Durée maximale de chaque requête HTTP en millisecondes, 10000 par défaut, comptée après la résolution du jeton.                                                                                                       |

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
