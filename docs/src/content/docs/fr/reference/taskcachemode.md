---
title: "TaskCacheMode"
description: "TaskCacheMode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskCacheMode } from "@elie-laloum/outpost";
```

## Rôle et comportement

mode d’un cache de tâche. Valeurs : "reuse" (par défaut ; renvoie une valeur stockée valide au lieu d’exécuter la tâche), "refresh" (ignore la lecture, exécute la tâche et remplace l’entrée).

[Exemple complet et règles détaillées](../../guide/task-cache/).

## Signature

```ts
export type TaskCacheMode = "reuse" | "refresh";
```
