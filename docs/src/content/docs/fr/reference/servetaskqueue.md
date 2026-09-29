---
title: "serveTaskQueue"
description: "serveTaskQueue — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { serveTaskQueue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Sert une TaskQueue appartenant à l’appelant via HTTP sur POST /queue, authentifiée par jetons bearer. Écoute par défaut sur 127.0.0.1 et un port choisi par le système, sans TLS. Refuse un jeton fixe qui ne compte pas 32 à 512 caractères sans espace.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom             | Type                                                                | Présence  | Rôle                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | `QueueServerOptions`                                                | Requis    | File à servir, jetons bearer acceptés, ainsi qu’hôte et port d’écoute.                                                                                                                                                                                         |
| `options.queue` | `TaskQueue`                                                         | Requis    | File servie via HTTP ; fermer le serveur la laisse ouverte.                                                                                                                                                                                                    |
| `options.token` | `string \| (() => readonly string[] \| Promise<readonly string[]>)` | Requis    | Jeton bearer accepté de 32 à 512 caractères sans espace, ou fonction renvoyant les jetons acceptés, appelée à chaque requête. Renvoyez ancien et nouveau jetons ensemble pendant une rotation ; une liste vide ou une erreur levée refuse toutes les requêtes. |
| `options.host`  | `string \| undefined`                                               | Optionnel | Adresse d’écoute, 127.0.0.1 par défaut.                                                                                                                                                                                                                        |
| `options.port`  | `number \| undefined`                                               | Optionnel | Port TCP, 0 par défaut : le système choisit un port libre, visible dans url.                                                                                                                                                                                   |

## Retour

`Promise<QueueServer>`

## Signature

```ts
export declare function serveTaskQueue(
  options: QueueServerOptions,
): Promise<QueueServer>;
```

## Contrats associés

- [QueueServer](../queueserver/)
- [QueueServerOptions](../queueserveroptions/)
