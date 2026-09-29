---
title: "TaskStatus"
description: "TaskStatus — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TaskStatus } from "@elie-laloum/outpost";
```

## Rôle et comportement

Statut d’une tâche de workflow dans son TaskRecord, les événements de workflow et les checkpoints. Valeurs : "waiting" (pas encore démarrée, ou remise en file pour s’exécuter à nouveau), "active" (en cours), "done" (terminée, y compris sur un hit de cache ou une gate approuvée), "failed" (a levé une erreur), "skipped" (sa condition a renvoyé false, ou une dépendance a échoué, a été ignorée, annulée ou rejetée), "cancelled" (le workflow a été interrompu ou son budget épuisé), "paused" (arrêtée à une gate ou par une pause de quota), "rejected" (une décision de gate l’a rejetée), "waiting-input" (une tâche interactive attend une réponse).

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Signature

```ts
export type TaskStatus =
  | "waiting-input"
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "skipped"
  | "cancelled"
  | "paused"
  | "rejected";
```
