---
title: "TaskRecord"
description: "TaskRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskRecord**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskRecord } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface TaskRecord {
  readonly key: string;
  status: TaskStatus;
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
