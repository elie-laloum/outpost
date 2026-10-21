---
title: "WorkflowJobNextAction"
description: "WorkflowJobNextAction — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowJobNextAction } from "@elie-laloum/outpost/queues";
```

## Rôle et comportement

Action attendue, déduite du statut enregistré d’un workflow : none après done, answer pour waiting-input, inspect-pause pour paused, et inspect pour les exécutions failed, cancelled ou rejected.

[Exemple complet et règles détaillées](../../guide/queued-workflows/).

## Signature

```ts
export type WorkflowJobNextAction =
  "none" | "answer" | "inspect-pause" | "inspect";
```
