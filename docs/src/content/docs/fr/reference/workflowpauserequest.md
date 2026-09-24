---
title: "WorkflowPauseRequest"
description: "WorkflowPauseRequest — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowPauseRequest**. Consultez le [guide approbations et pauses](../../workflows/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowPauseRequest } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Contrats associés

- [WorkflowGate](../workflowgate/)
