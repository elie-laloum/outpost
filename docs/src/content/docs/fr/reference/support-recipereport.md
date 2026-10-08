---
title: "RecipeReport"
description: "RecipeReport — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom              | Type                                                                                                         | Présence  | Rôle                                                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`          | `string \| undefined`                                                                                        | Optionnel | Run ID du checkpoint pour une invocation de recette durable.                                                                                                                                                                                                                                        |
| `inputRequests`  | `readonly WorkflowInputRequest[] \| undefined`                                                               | Optionnel | Questions de dialogue persistées attendant une réponse autorisée.                                                                                                                                                                                                                                   |
| `observerErrors` | `readonly RecipeDiagnostic[] \| undefined`                                                                   | Optionnel | Échecs de fermeture des composants d’observation possédés, rapportés sans modifier le statut d’exécution. Les valeurs des secrets sélectionnés par ce runtime sont masquées.                                                                                                                        |
| `name`           | `string`                                                                                                     | Requis    | Nom de recette associé à cette invocation.                                                                                                                                                                                                                                                          |
| `executionId`    | `string \| undefined`                                                                                        | Optionnel | Identifiant d’exécution du workflow, présent une fois le workflow démarré.                                                                                                                                                                                                                          |
| `status`         | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused"`                             | Requis    | Statut final incluant intégration, annulation et nettoyage de la sandbox.                                                                                                                                                                                                                           |
| `workflowStatus` | `"failed" \| "done" \| "cancelled" \| "rejected" \| "waiting-input" \| "paused" \| undefined`                | Optionnel | Résultat des tâches du workflow avant intégration et nettoyage.                                                                                                                                                                                                                                     |
| `tasks`          | `readonly Readonly<TaskRecord>[]`                                                                            | Requis    | Enregistrements d’exécution des tâches renvoyés par le workflow.                                                                                                                                                                                                                                    |
| `usage`          | `WorkflowUsage \| undefined`                                                                                 | Optionnel | Consommation agrégée du workflow lorsqu’un résultat est disponible.                                                                                                                                                                                                                                 |
| `outputs`        | `Readonly<Record<string, Readonly<Record<string, WorkflowJson>>>>`                                           | Requis    | Sorties des tâches terminées : textes bornés pour les anciens formats, projections JSON explicites pour le format 3. Les tâches de valeur, callback, boucle et décision exposent leur résultat dans value ; les dispatch conservent leurs références de conversation et de workspace sans méthodes. |
| `errors`         | `readonly RecipeDiagnostic[]`                                                                                | Requis    | Diagnostics bornés des échecs de tâches, intégration et nettoyage.                                                                                                                                                                                                                                  |
| `workspace`      | `{ readonly branch: string; readonly directory: string; readonly retainedDirectory?: string; } \| undefined` | Optionnel | Workspace partagé et répertoire conservé lorsque cette exécution a alloué une sandbox partagée. Absent des workflows de données et de tâches exclusivement isolées.                                                                                                                                 |

## Signature

```ts
export interface RecipeReport {
  readonly runId?: string;
  readonly inputRequests?: WorkflowResult["inputRequests"];
  readonly observerErrors?: readonly RecipeDiagnostic[];
  readonly name: string;
  readonly executionId?: string;
  readonly status: WorkflowResult["status"];
  readonly workflowStatus?: WorkflowResult["status"];
  readonly tasks: WorkflowResult["tasks"];
  readonly usage?: WorkflowResult["usage"];
  readonly outputs: Readonly<
    Record<string, Readonly<Record<string, WorkflowJson>>>
  >;
  readonly errors: readonly RecipeDiagnostic[];
  readonly workspace?: {
    readonly branch: string;
    readonly directory: string;
    readonly retainedDirectory?: string;
  };
}
```

## Contrats associés

- [RecipeDiagnostic](../support-recipediagnostic/)
- [WorkflowJson](../workflowjson/)
- [WorkflowResult](../workflowresult/)
