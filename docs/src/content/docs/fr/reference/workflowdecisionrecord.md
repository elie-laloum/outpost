---
title: "WorkflowDecisionRecord"
description: "WorkflowDecisionRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowDecisionRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                        | Présence  | Rôle                                                                                                                                                                   |
| -------------- | ------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verification` | `WorkflowDecisionVerification \| undefined` | Optionnel | Identifiant de clé vérifiée et date de vérification conservés pour audit ; ne contient ni clé privée ni jeton bearer.                                                  |
| `decidedAt`    | `string`                                    | Requis    | Horodatage ISO attribué lors de la validation et de l’enregistrement de la décision.                                                                                   |
| `executionId`  | `string`                                    | Requis    | executionId de l’exécution qui a suspendu la gate, lu dans son WorkflowResult ; toute autre valeur rejette le lot entier.                                              |
| `key`          | `string`                                    | Requis    | Clé de la tâche gate à décider.                                                                                                                                        |
| `requestId`    | `string`                                    | Requis    | id de la demande en attente de la gate (WorkflowPauseRequest.id) ; un id périmé ou inconnu rejette le lot entier.                                                      |
| `action`       | `"approve" \| "resume" \| "reject"`         | Requis    | approve pour une gate d’approbation, resume pour une gate de pause, ou reject pour l’une ou l’autre. reject ignore les tâches dépendantes et fait échouer l’exécution. |
| `actor`        | `string`                                    | Requis    | L’un des acteurs de la gate. Outpost fait confiance à ce nom, sauf pour une gate signée, où la clé de la preuve doit lui être liée.                                    |
| `reason`       | `string`                                    | Requis    | Explication non vide de la décision, conservée dans le checkpoint.                                                                                                     |

## Signature

```ts
export interface WorkflowDecisionRecord extends Omit<
  WorkflowDecision,
  "proof"
> {
  readonly verification?: WorkflowDecisionVerification;
  readonly decidedAt: string;
}
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionVerification](../workflowdecisionverification/)
