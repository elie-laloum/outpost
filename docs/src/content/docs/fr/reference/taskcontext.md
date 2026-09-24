---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TaskContext**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface TaskContext {
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  reportUsageOnce?(receipt: string, usage: Usage): void;
  checkpoint?(): Promise<void>;
  value<T>(dependency: Task<T>): T;
}
```

## Contrats associés

- [Task](../task/)
- [Usage](../usage/)
