---
title: "QueueClientOptions"
description: "QueueClientOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueClientOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                              |
| ----------- | --------------------- | --------- | ----------------------------------------------------------------- |
| `url`       | `string`              | Requis    | URL HTTP de base du serveur de file de tâches.                    |
| `token`     | `string`              | Requis    | Identifiant de transport explicite ; jamais dans une URL.         |
| `timeoutMs` | `number \| undefined` | Optionnel | Durée maximale en millisecondes de chaque requête HTTP à la file. |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string;
  readonly timeoutMs?: number;
}
```
