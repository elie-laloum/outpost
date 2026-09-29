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

| Nom        | Type               | Présence | Rôle                                                                                                                                                                                 |
| ---------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `decision` | `WorkflowDecision` | Requis   | Décision à authentifier, preuve comprise. Levez une erreur si la signature, la clé, l’acteur associé ou l’expiration est invalide ; start() n’applique alors aucune décision du lot. |

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
