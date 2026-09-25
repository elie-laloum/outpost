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

Expose une file appartenant à l’appelant via HTTP avec authentification explicite par jeton bearer. Le serveur écoute loopback par défaut et ne fournit pas TLS. Fermer le serveur arrête l’écoute sans prendre possession du stockage de la file.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom             | Type                  | Présence  | Rôle                                                                                     |
| --------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `options`       | `QueueServerOptions`  | Requis    | File appartenant à l’appelant, jeton bearer et adresse/port d’écoute HTTP.               |
| `options.queue` | `TaskQueue`           | Requis    | File de tâches utilisée pour envoyer, prendre en charge et persister l’état des travaux. |
| `options.token` | `string`              | Requis    | Identifiant de transport explicite ; jamais dans une URL.                                |
| `options.host`  | `string \| undefined` | Optionnel | Adresse d’écoute HTTP ; loopback par défaut pour un accès local uniquement.              |
| `options.port`  | `number \| undefined` | Optionnel | Port TCP du serveur HTTP de file ; zéro laisse le système choisir un port disponible.    |

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
