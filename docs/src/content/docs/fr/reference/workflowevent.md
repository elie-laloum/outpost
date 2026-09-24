---
title: "WorkflowEvent"
description: "WorkflowEvent — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowEvent**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowEvent } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowEvent {
  readonly executionId: string;
  readonly workflow: string;
  readonly timestamp: string;
  readonly type: "start" | "task" | "attempt" | "retry" | "usage" | "finish";
  readonly key?: string;
  readonly status?: TaskStatus;
  readonly attempt?: number;
  readonly usage?: Usage;
  readonly durationMs?: number;
}
```

## Contrats associés

- [TaskStatus](../taskstatus/)
- [Usage](../usage/)
