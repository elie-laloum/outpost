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

| Nom       | Type                              | Présence  | Rôle                                                                                                                                |
| --------- | --------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `store`   | `WorkflowCheckpointStore`         | Requis    | Stockage de checkpoints qui contient chaque exécution.                                                                              |
| `version` | `string`                          | Requis    | À changer lorsque les implémentations de tâches changent ; la version effective ajoute #input: et une empreinte de l’entrée du job. |
| `resume`  | `"retry-incomplete" \| undefined` | Optionnel | Autorise explicitement le rejeu des tâches incomplètes et de leurs effets de bord.                                                  |

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
