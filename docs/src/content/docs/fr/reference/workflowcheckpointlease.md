---
title: "WorkflowCheckpointLease"
description: "WorkflowCheckpointLease — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowCheckpointLease } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                | Présence | Rôle                                                                                                                                                                                                                                                    |
| --------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `read`    | `() => Promise<unknown>`                            | Requis   | Renvoie le checkpoint sauvegardé comme donnée non validée, ou undefined pour une nouvelle exécution. start() le valide par rapport au workflow avant d’exécuter une tâche.                                                                              |
| `write`   | `(checkpoint: WorkflowCheckpoint) => Promise<void>` | Requis   | Remplace le checkpoint sauvegardé tant que le bail est détenu. createWorkflowCheckpointStore() écrit sous condition de la dernière révision, rejette avec TransportConflict une fois la possession perdue, et refuse les checkpoints de plus de 16 Mio. |
| `release` | `() => Promise<void>`                               | Requis   | Efface la possession une fois les écritures en cours terminées et conserve le checkpoint sauvegardé. start() l’appelle lorsqu’il se termine ou rejette.                                                                                                 |

## Signature

```ts
export interface WorkflowCheckpointLease {
  read(): Promise<unknown>;
  write(checkpoint: WorkflowCheckpoint): Promise<void>;
  release(): Promise<void>;
}
```

## Contrats associés

- [WorkflowCheckpoint](../workflowcheckpoint/)
