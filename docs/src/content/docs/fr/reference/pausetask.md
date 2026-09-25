---
title: "pauseTask"
description: "pauseTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { pauseTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une pause persistée par checkpoint qui attend une décision explicite resume ou reject d’un acteur de confiance autorisé. Elle n’utilise aucun timer d’attente et survit au redémarrage du processus ; contrairement à approvalTask, son action de succès est resume.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom              | Type                                    | Présence  | Rôle                                                                                                                        |
| ---------------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `options`        | `WorkflowGateOptions`                   | Requis    | Clé de gate, dépendances, demande de pause et acteurs de confiance autorisés à reprendre ou rejeter.                        |
| `options.key`    | `string`                                | Requis    | Clé de tâche stable identifiant le nœud dans son graphe de workflow.                                                        |
| `options.after`  | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                                                   |
| `options.prompt` | `string`                                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                            |
| `options.actors` | `readonly string[]`                     | Requis    | Liste non vide des noms d’acteurs de confiance autorisés à décider cette gate ; leur authentification relève de l’appelant. |

## Retour

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function pauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Contrats associés

- [Task](../type-task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
