---
title: "defineApprovalTask"
description: "defineApprovalTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineApprovalTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une gate d’approbation persistée par checkpoint qui suspend l’exécution après ses dépendances. Un acteur de confiance autorisé doit soumettre approve ou reject avec un motif. L’approbation transmet la décision persistée aux tâches dépendantes ; le rejet est définitif pour cette exécution.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom                      | Type                                    | Présence  | Rôle                                                                                                                                         |
| ------------------------ | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `WorkflowGateOptions`                   | Requis    | Clé de gate, dépendances, demande d’approbation et acteurs de confiance autorisés à approuver ou rejeter.                                    |
| `options.authentication` | `"signed" \| undefined`                 | Optionnel | Exige une preuve vérifiée pour ce gate d’approbation ou de pause et inscrit cette exigence dans l’identité du graphe.                        |
| `options.key`            | `string`                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                                         |
| `options.after`          | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                                    |
| `options.prompt`         | `string`                                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                                             |
| `options.actors`         | `readonly string[]`                     | Requis    | Noms d’acteurs non vides et uniques autorisés à décider le gate créé ; l’authentification signée lie l’acteur choisi à une clé de confiance. |

## Retour

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function defineApprovalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Contrats associés

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
