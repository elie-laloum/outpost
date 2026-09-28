---
title: "QueueServerOptions"
description: "QueueServerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueServerOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                                                                | Présence  | Rôle                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue` | `TaskQueue`                                                         | Requis    | File de tâches utilisée pour envoyer, prendre en charge et persister l’état des travaux.                                                                                                  |
| `token` | `string \| (() => readonly string[] \| Promise<readonly string[]>)` | Requis    | Jeton bearer fixe ou callback renvoyant les jetons acceptés à chaque requête. Faites coexister ancien et nouveau jetons pendant la rotation ; une source vide ou en échec refuse l’accès. |
| `host`  | `string \| undefined`                                               | Optionnel | Adresse d’écoute HTTP ; loopback par défaut pour un accès local uniquement.                                                                                                               |
| `port`  | `number \| undefined`                                               | Optionnel | Port TCP du serveur HTTP de file ; zéro laisse le système choisir un port disponible.                                                                                                     |

## Signature

```ts
export interface QueueServerOptions {
  readonly queue: TaskQueue;
  readonly token:
    string | (() => readonly string[] | Promise<readonly string[]>);
  readonly host?: string;
  readonly port?: number;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
