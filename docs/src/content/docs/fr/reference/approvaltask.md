---
title: "approvalTask"
description: "approvalTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **approvalTask**. Consultez le [guide approbations et pauses](../../guide/advanced/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { approvalTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister une décision attendue et bloquer les dépendants jusqu’à sa soumission par un appelant de confiance.

Les noms d’acteurs sont des métadonnées de confiance, pas une authentification. Une pause ne nécessite aucun timer. Le rejet est définitif pour cette exécution. Un lot invalide échoue avant toute application.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom              | Type                                    | Présence  | Rôle                                                                                          |
| ---------------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`        | `WorkflowGateOptions`                   | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.key`    | `string`                                | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                                        |
| `options.after`  | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                     |
| `options.prompt` | `string`                                | Requis    | Instruction lisible présentée à cette étape.                                                  |
| `options.actors` | `readonly string[]`                     | Requis    | Identifiants d’acteurs de confiance, sans mécanisme d’authentification.                       |

## Retour

`Task<WorkflowDecisionRecord>`

## Signature

```ts
export declare function approvalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Contrats associés

- [Task](../task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
