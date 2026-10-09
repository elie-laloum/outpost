---
title: "WorkflowCheckpointOptions"
description: "WorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                              | Présence  | Rôle                                                                                                                                                                                                                                                   |
| ------------ | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspaces` | `true \| undefined`               | Optionnel | Capacité versionnée de ressources de fichiers activée explicitement ; les anciens providers et checkpoints conservent leur contrat Git.                                                                                                                |
| `store`      | `WorkflowCheckpointStore`         | Requis    | Store qui accorde la possession exclusive de l’exécution, puis lit et écrit son checkpoint, en général createWorkflowCheckpointStore().                                                                                                                |
| `runId`      | `string`                          | Requis    | Clé de l’exécution sauvegardée : un start() ultérieur avec le même runId la restaure. Les valeurs vides sont refusées.                                                                                                                                 |
| `version`    | `string`                          | Requis    | Votre version du code des tâches, des briefs et des entrées, incluse dans l’empreinte d’identité du checkpoint avec le nom du workflow et le graphe des tâches. Une exécution sauvegardée ne change pas de version : démarrez plutôt un nouveau runId. |
| `resume`     | `"retry-incomplete" \| undefined` | Optionnel | Valeur retry-incomplete pour rouvrir un checkpoint contenant des tâches en échec, annulées ou interrompues et les exécuter de nouveau, avec les effets de bord déjà produits. Sans elle, start() rejette un tel checkpoint avant toute exécution.      |

## Signature

```ts
export interface WorkflowCheckpointOptions {
  readonly workspaces?: true;
  readonly store: WorkflowCheckpointStore;
  readonly runId: string;
  /** Change when task implementations or workflow inputs change. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}
```

## Contrats associés

- [WorkflowCheckpointStore](../workflowcheckpointstore/)
