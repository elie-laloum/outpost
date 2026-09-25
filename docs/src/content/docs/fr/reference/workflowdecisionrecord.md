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

| Nom           | Type                                | Présence | Rôle                                                                                                     |
| ------------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `decidedAt`   | `string`                            | Requis   | Horodatage ISO attribué lors de la validation et de l’enregistrement de la décision.                     |
| `executionId` | `string`                            | Requis   | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                       |
| `key`         | `string`                            | Requis   | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                     |
| `requestId`   | `string`                            | Requis   | Identifiant de la demande de gate précise à laquelle répondre ; les demandes périmées sont rejetées.     |
| `action`      | `"resume" \| "approve" \| "reject"` | Requis   | approve pour une approbation, resume pour une pause, ou reject pour terminer l’une ou l’autre par rejet. |
| `actor`       | `string`                            | Requis   | Nom d’acteur fourni par un appelant de confiance et devant figurer dans la liste actors de la gate.      |
| `reason`      | `string`                            | Requis   | Explication non vide fournie par l’acteur de confiance pour sa décision.                                 |

## Signature

```ts
export interface WorkflowDecisionRecord extends WorkflowDecision {
  readonly decidedAt: string;
}
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
