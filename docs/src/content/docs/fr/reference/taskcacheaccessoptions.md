---
title: "TaskCacheAccessOptions"
description: "TaskCacheAccessOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheAccessOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                       | Présence  | Rôle                                                                            |
| -------- | -------------------------- | --------- | ------------------------------------------------------------------------------- |
| `signal` | `AbortSignal \| undefined` | Optionnel | Signal d’annulation du workflow transmis à la lecture ou à l’écriture du store. |

## Signature

```ts
export interface TaskCacheAccessOptions {
  readonly signal?: AbortSignal;
}
```
