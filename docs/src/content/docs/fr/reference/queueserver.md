---
title: "QueueServer"
description: "QueueServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueServer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                  | Présence | Rôle                                                               |
| ------- | --------------------- | -------- | ------------------------------------------------------------------ |
| `url`   | `string`              | Requis   | URL HTTP de base du serveur de file de tâches.                     |
| `close` | `() => Promise<void>` | Requis   | Arrête l’écoute HTTP sans fermer la file appartenant à l’appelant. |

## Signature

```ts
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
```
