---
title: "TaskCacheOutcome"
description: "TaskCacheOutcome — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskCacheOutcome } from "@elie-laloum/outpost";
```

## Rôle et comportement

Résultat d’une étape du cache de tâche, dans le champ cache d’un événement de workflow cache. Valeurs : "hit" (une entrée valide est réutilisée ; la tâche se termine sans s’exécuter), "miss" (aucune entrée, entrée plus ancienne que maxAgeMs, ou mode refresh), "stored" (le résultat est écrit après la réussite de la tâche), "failed" (échec d’une lecture, d’une écriture ou de la validation d’une entrée ; la tâche continue comme sur un miss).

[Exemple complet et règles détaillées](../../guide/task-cache/).

## Signature

```ts
export type TaskCacheOutcome = "hit" | "miss" | "stored" | "failed";
```
