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

| Nom     | Type                  | Présence | Rôle                                                                                                    |
| ------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `url`   | `string`              | Requis   | URL de base du serveur à l’écoute, par exemple http://127.0.0.1:8788, à passer à createHttpTaskQueue(). |
| `close` | `() => Promise<void>` | Requis   | Arrête l’écoute et ferme les connexions inactives ; la file servie reste ouverte.                       |

## Signature

```ts
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
```
