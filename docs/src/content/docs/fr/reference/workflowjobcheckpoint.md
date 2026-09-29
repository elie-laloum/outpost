---
title: "WorkflowJobCheckpoint"
description: "WorkflowJobCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowJobCheckpoint } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                              | Présence  | Rôle                                                                                                                                                                     |
| --------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `store`   | `WorkflowCheckpointStore`         | Requis    | Stockage de checkpoints qui contient chaque exécution.                                                                                                                   |
| `version` | `string`                          | Requis    | Version de base ; changez-la quand l’implémentation des tâches change. La version effective ajoute #input: et une empreinte SHA-256 de 32 caractères de l’entrée du job. |
| `resume`  | `"retry-incomplete" \| undefined` | Optionnel | Valeur retry-incomplete pour autoriser le rejeu des tâches incomplètes et de leurs effets de bord ; sans elle, un checkpoint incomplet termine le job avec une erreur.   |

## Signature

```ts
export interface WorkflowJobCheckpoint {
  readonly store: WorkflowCheckpointStore;
  /** Combined with a digest of the job input to form the checkpoint version. */
  readonly version: string;
  /** Explicitly authorize replay of incomplete tasks and their side effects. */
  readonly resume?: "retry-incomplete";
}
```

## Contrats associés

- [WorkflowCheckpointStore](../workflowcheckpointstore/)
