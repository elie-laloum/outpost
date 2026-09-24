---
title: "WorkflowResult"
description: "WorkflowResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowResult**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowResult {
  readonly executionId: string;
  readonly name: string;
  readonly status: "done" | "failed" | "cancelled";
  readonly tasks: readonly Readonly<TaskRecord>[];
  readonly errors: readonly unknown[];
  readonly observerErrors: readonly unknown[];
  readonly usage: WorkflowUsage;
  value<T>(task: Task<T>): T;
  unwrap(): void;
}
```

## Contrats associés

- [Task](../task/)
- [TaskRecord](../taskrecord/)
- [WorkflowUsage](../workflowusage/)
