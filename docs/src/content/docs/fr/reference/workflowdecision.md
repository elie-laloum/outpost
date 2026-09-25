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

| Nom           | Type                                | Présence | Rôle                                                                                                     |
| ------------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `executionId` | `string`                            | Requis   | Identité de l’exécution de workflow, conservée lors de la reprise d’un checkpoint.                       |
| `key`         | `string`                            | Requis   | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                     |
| `requestId`   | `string`                            | Requis   | Identifiant de la demande de gate précise à laquelle répondre ; les demandes périmées sont rejetées.     |
| `action`      | `"approve" \| "resume" \| "reject"` | Requis   | approve pour une approbation, resume pour une pause, ou reject pour terminer l’une ou l’autre par rejet. |
| `actor`       | `string`                            | Requis   | Nom d’acteur fourni par un appelant de confiance et devant figurer dans la liste actors de la gate.      |
| `reason`      | `string`                            | Requis   | Explication non vide fournie par l’acteur de confiance pour sa décision.                                 |

## Signature

```ts
export interface WorkflowDecision {
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly action: "approve" | "resume" | "reject";
  readonly actor: string;
  readonly reason: string;
}
```
