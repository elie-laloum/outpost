---
title: "definePauseTask"
description: "definePauseTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { definePauseTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une pause persistée par checkpoint qui attend une décision explicite resume ou reject d’un acteur de confiance autorisé. Elle n’utilise aucun timer d’attente et survit au redémarrage du processus ; contrairement à defineApprovalTask, son action de succès est resume.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom                      | Type                                    | Présence  | Rôle                                                                                                                                         |
| ------------------------ | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `WorkflowGateOptions`                   | Requis    | Clé de gate, dépendances, demande de pause et acteurs de confiance autorisés à reprendre ou rejeter.                                         |
| `options.authentication` | `"signed" \| undefined`                 | Optionnel | Exige une preuve vérifiée pour ce gate d’approbation ou de pause et inscrit cette exigence dans l’identité du graphe.                        |
| `options.key`            | `string`                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                         |
| `options.after`          | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                    |
| `options.prompt`         | `string`                                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                                             |
| `options.actors`         | `readonly string[]`                     | Requis    | Noms d’acteurs non vides et uniques autorisés à décider le gate créé ; l’authentification signée lie l’acteur choisi à une clé de confiance. |

## Retour

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function definePauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Contrats associés

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
