---
title: "WorkflowTelemetry"
description: "WorkflowTelemetry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowTelemetry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                             | Présence | Rôle                                                                                                                                                                                                                                                 |
| --------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observe` | `(event: WorkflowEvent) => void` | Requis   | Reçoit de manière synchrone chaque événement de cycle de vie et d’usage du workflow, avec l’adaptateur comme receveur. Les erreurs levées sont collectées dans WorkflowResult.observerErrors sans affecter les tâches ni le callback observe séparé. |

## Signature

```ts
export interface WorkflowTelemetry {
  observe(event: WorkflowEvent): void;
}
```

## Contrats associés

- [WorkflowEvent](../workflowevent/)
