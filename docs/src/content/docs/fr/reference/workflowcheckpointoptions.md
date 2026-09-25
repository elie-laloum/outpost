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

| Nom       | Type                              | Présence  | Rôle                                                                                                                    |
| --------- | --------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `store`   | `WorkflowCheckpointStore`         | Requis    | Adapter de persistance acquérant, lisant et écrivant les checkpoints du workflow.                                       |
| `runId`   | `string`                          | Requis    | Identité stable d’une exécution sauvegardée.                                                                            |
| `version` | `string`                          | Requis    | Version de graphe/implémentation fournie par l’appelant ; à changer lorsque le code des tâches ou les entrées changent. |
| `resume`  | `"retry-incomplete" \| undefined` | Optionnel | Autorisation explicite retry-incomplete de rejouer les tâches interrompues et leurs effets possibles.                   |

## Signature

```ts
export interface WorkflowCheckpointOptions {
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
