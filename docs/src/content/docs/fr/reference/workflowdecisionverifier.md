---
title: "WorkflowDecisionVerifier"
description: "WorkflowDecisionVerifier — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowDecisionVerifier } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type               | Présence | Rôle                                                                                                                                              |
| ---------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `decision` | `WorkflowDecision` | Requis   | Décision complète et preuve à authentifier ; refuser signatures invalides, mauvaises associations d’identité, clés révoquées et preuves expirées. |

## Retour

`WorkflowDecisionVerification | Promise<WorkflowDecisionVerification>`

## Signature

```ts
export type WorkflowDecisionVerifier = (
  decision: WorkflowDecision,
) => Promise<WorkflowDecisionVerification> | WorkflowDecisionVerification;
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionVerification](../workflowdecisionverification/)
