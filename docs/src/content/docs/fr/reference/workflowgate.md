---
title: "WorkflowGate"
description: "WorkflowGate — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowGate**. Consultez le [guide approbations et pauses](../../workflows/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowGate } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
