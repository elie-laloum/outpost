---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowGateOptions**. Consultez le [guide approbations et pauses](../../workflows/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Contrats associés

- [Task](../task/)
