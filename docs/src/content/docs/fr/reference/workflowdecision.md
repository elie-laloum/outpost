---
title: "WorkflowDecision"
description: "WorkflowDecision — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecision } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                 | Présence  | Rôle                                                                                                                                                                                                       |
| ------------- | ------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `proof`       | `WorkflowDecisionProof \| undefined` | Optionnel | Preuve Ed25519 issue de signWorkflowDecision() portant sur cette décision exacte. Une gate signée l’exige ; une preuve envoyée à une gate non signée est aussi vérifiée et exige donc un decisionVerifier. |
| `executionId` | `string`                             | Requis    | executionId de l’exécution qui a suspendu la gate, lu dans son WorkflowResult ; toute autre valeur rejette le lot entier.                                                                                  |
| `key`         | `string`                             | Requis    | Clé de la tâche gate à décider.                                                                                                                                                                            |
| `requestId`   | `string`                             | Requis    | id de la demande en attente de la gate (WorkflowPauseRequest.id) ; un id périmé ou inconnu rejette le lot entier.                                                                                          |
| `action`      | `"resume" \| "approve" \| "reject"`  | Requis    | approve pour une gate d’approbation, resume pour une gate de pause, ou reject pour l’une ou l’autre. reject ignore les tâches dépendantes et fait échouer l’exécution.                                     |
| `actor`       | `string`                             | Requis    | L’un des acteurs de la gate. Outpost fait confiance à ce nom, sauf pour une gate signée, où la clé de la preuve doit lui être liée.                                                                        |
| `reason`      | `string`                             | Requis    | Explication non vide de la décision, conservée dans le checkpoint.                                                                                                                                         |

## Signature

```ts
export interface WorkflowDecision {
  readonly proof?: WorkflowDecisionProof;
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly action: "approve" | "resume" | "reject";
  readonly actor: string;
  readonly reason: string;
}
```

## Contrats associés

- [WorkflowDecisionProof](../workflowdecisionproof/)
