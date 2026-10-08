---
title: "RecipeReport"
description: "RecipeReport — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom              | Type                                                                                            | Présence  | Rôle                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `name`           | `string`                                                                                        | Requis    | Nom de recette associé à cette invocation.                                               |
| `executionId`    | `string \| undefined`                                                                           | Optionnel | Identifiant d’exécution du workflow, présent une fois le workflow démarré.               |
| `status`         | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused"`                | Requis    | Statut final incluant intégration, annulation et nettoyage de la sandbox.                |
| `workflowStatus` | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused" \| undefined`   | Optionnel | Résultat des tâches du workflow avant intégration et nettoyage.                          |
| `tasks`          | `readonly Readonly<TaskRecord>[]`                                                               | Requis    | Enregistrements d’exécution des tâches renvoyés par le workflow.                         |
| `usage`          | `WorkflowUsage \| undefined`                                                                    | Optionnel | Consommation agrégée du workflow lorsqu’un résultat est disponible.                      |
| `outputs`        | `Readonly<Record<string, Readonly<Record<string, string \| number>>>>`                          | Requis    | Sorties scalaires bornées des tâches terminées, indexées par leur nom.                   |
| `errors`         | `readonly RecipeDiagnostic[]`                                                                   | Requis    | Diagnostics bornés des échecs de tâches, intégration et nettoyage.                       |
| `workspace`      | `{ readonly branch: string; readonly directory: string; readonly retainedDirectory?: string; }` | Requis    | Branche et dossier du workspace, avec retainedDirectory lorsque le travail est conservé. |

## Signature

```ts
export interface RecipeReport {
  readonly name: string;
  readonly executionId?: string;
  readonly status: WorkflowResult["status"];
  readonly workflowStatus?: WorkflowResult["status"];
  readonly tasks: WorkflowResult["tasks"];
  readonly usage?: WorkflowResult["usage"];
  readonly outputs: Readonly<
    Record<string, Readonly<Record<string, string | number>>>
  >;
  readonly errors: readonly RecipeDiagnostic[];
  readonly workspace: {
    readonly branch: string;
    readonly directory: string;
    readonly retainedDirectory?: string;
  };
}
```

## Contrats associés

- [RecipeDiagnostic](../support-recipediagnostic/)
- [WorkflowResult](../workflowresult/)
