---
title: "TaskStatus"
description: "TaskStatus — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskStatus**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskStatus } from "@elie-laloum/outpost";
```

## Signature

```ts
export type TaskStatus =
  | "waiting"
  | "active"
  | "done"
  | "failed"
  | "skipped"
  | "cancelled"
  | "paused"
  | "rejected";
```
