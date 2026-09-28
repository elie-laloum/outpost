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

| Nom            | Type                                        | Présence  | Rôle                                                                                                                  |
| -------------- | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `verification` | `WorkflowDecisionVerification \| undefined` | Optionnel | Identifiant de clé vérifiée et date de vérification conservés pour audit ; ne contient ni clé privée ni jeton bearer. |
| `decidedAt`    | `string`                                    | Requis    | Horodatage ISO attribué lors de la validation et de l’enregistrement de la décision.                                  |
| `executionId`  | `string`                                    | Requis    | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                                    |
| `key`          | `string`                                    | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                  |
| `requestId`    | `string`                                    | Requis    | Identifiant de la demande de gate précise à laquelle répondre ; les demandes périmées sont rejetées.                  |
| `action`       | `"approve" \| "resume" \| "reject"`         | Requis    | approve pour une approbation, resume pour une pause, ou reject pour terminer l’une ou l’autre par rejet.              |
| `actor`        | `string`                                    | Requis    | Nom d’acteur autorisé par le gate ; les gates signés vérifient aussi la clé publique associée à cet acteur.           |
| `reason`       | `string`                                    | Requis    | Explication non vide fournie par l’acteur de confiance pour sa décision.                                              |

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
