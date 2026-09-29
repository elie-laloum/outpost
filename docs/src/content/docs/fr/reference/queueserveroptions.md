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

| Nom     | Type                                                                | Présence  | Rôle                                                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queue` | `TaskQueue`                                                         | Requis    | File servie via HTTP ; fermer le serveur la laisse ouverte.                                                                                                                                                                                                    |
| `token` | `string \| (() => readonly string[] \| Promise<readonly string[]>)` | Requis    | Jeton bearer accepté de 32 à 512 caractères sans espace, ou fonction renvoyant les jetons acceptés, appelée à chaque requête. Renvoyez ancien et nouveau jetons ensemble pendant une rotation ; une liste vide ou une erreur levée refuse toutes les requêtes. |
| `host`  | `string \| undefined`                                               | Optionnel | Adresse d’écoute, 127.0.0.1 par défaut.                                                                                                                                                                                                                        |
| `port`  | `number \| undefined`                                               | Optionnel | Port TCP, 0 par défaut : le système choisit un port libre, visible dans url.                                                                                                                                                                                   |

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
