---
title: "approvalTask"
description: "approvalTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { approvalTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une gate d’approbation persistée par checkpoint qui suspend l’exécution après ses dépendances. Un acteur de confiance autorisé doit soumettre approve ou reject avec un motif. L’approbation transmet la décision persistée aux tâches dépendantes ; le rejet est définitif pour cette exécution.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom              | Type                                    | Présence  | Rôle                                                                                                                        |
| ---------------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `options`        | `WorkflowGateOptions`                   | Requis    | Clé de gate, dépendances, demande d’approbation et acteurs de confiance autorisés à approuver ou rejeter.                   |
| `options.key`    | `string`                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                        |
| `options.after`  | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                   |
| `options.prompt` | `string`                                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                            |
| `options.actors` | `readonly string[]`                     | Requis    | Liste non vide des noms d’acteurs de confiance autorisés à décider cette gate ; leur authentification relève de l’appelant. |

## Retour

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function approvalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Contrats associés

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
