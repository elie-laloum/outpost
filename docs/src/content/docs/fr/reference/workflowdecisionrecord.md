---
title: "WorkflowDecisionRecord"
description: "WorkflowDecisionRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowDecisionRecord**. Consultez le [guide approbations et pauses](../../workflows/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowDecisionRecord } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowDecisionRecord extends WorkflowDecision {
  readonly decidedAt: string;
}
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
