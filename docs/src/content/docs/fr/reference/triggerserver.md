---
title: "TriggerServer"
description: "TriggerServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerServer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                  | Présence | Rôle                                                                                            |
| ------- | --------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `url`   | `string`              | Requis   | URL de base du serveur à l’écoute, comme http://127.0.0.1:8787.                                 |
| `close` | `() => Promise<void>` | Requis   | Cesse d’accepter les connexions et se résout une fois le serveur fermé ; la file reste ouverte. |

## Signature

```ts
export interface TriggerServer {
  readonly url: string;
  close(): Promise<void>;
}
```
