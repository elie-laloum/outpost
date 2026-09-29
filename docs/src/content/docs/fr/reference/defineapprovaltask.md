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

Définit une tâche gate qui suspend l’exécution une fois ses dépendances terminées et attend approve ou reject d’un acteur autorisé. approve fait du WorkflowDecisionRecord la valeur de la gate ; reject ignore les tâches dépendantes et fait échouer l’exécution. Lève une erreur si le prompt est vide ou si les acteurs sont absents, vides ou dupliqués ; l’ordonnancer sans checkpoint lève aussi une erreur.

[Exemple complet et règles détaillées](../../guide/approvals/).

## Paramètres et propriétés

| Nom                      | Type                                    | Présence  | Rôle                                                                                                                                                                       |
| ------------------------ | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `WorkflowGateOptions`                   | Requis    | Clé de la gate, dépendances, prompt, acteurs autorisés à approuver ou rejeter, et l’authentification signed facultative.                                                   |
| `options.authentication` | `"signed" \| undefined`                 | Optionnel | signed exige une preuve Ed25519 vérifiée sur chaque décision de cette gate. Enregistré dans la gate et dans l’identité du checkpoint.                                      |
| `options.key`            | `string`                                | Requis    | Clé de tâche de la gate, unique dans le workflow et reprise par chaque décision. Lettres, chiffres, point, tiret bas et tiret, en commençant par une lettre ou un chiffre. |
| `options.after`          | `readonly Task<unknown>[] \| undefined` | Optionnel | Tâches qui doivent être terminées avant que la gate se suspende. Si l’une échoue ou est ignorée, annulée ou rejetée, la gate est ignorée.                                  |
| `options.prompt`         | `string`                                | Requis    | Question posée aux acteurs, copiée dans la demande en attente. Un prompt vide lève une erreur.                                                                             |
| `options.actors`         | `readonly string[]`                     | Requis    | Noms autorisés à décider la gate : au moins un, uniques et non vides. Outpost fait confiance à l’acteur soumis par votre application, sauf si la gate est signée.          |

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
