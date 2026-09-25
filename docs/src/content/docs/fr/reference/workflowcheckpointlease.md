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

| Nom       | Type                                                | Présence | Rôle                                                                                                                             |
| --------- | --------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `read`    | `() => Promise<unknown>`                            | Requis   | Lit le checkpoint sauvegardé comme valeur inconnue à valider ; ne renvoie aucune valeur sauvegardée pour une nouvelle exécution. |
| `write`   | `(checkpoint: WorkflowCheckpoint) => Promise<void>` | Requis   | Persiste atomiquement le checkpoint fourni sous la possession du bail.                                                           |
| `release` | `() => Promise<void>`                               | Requis   | Libère la possession exclusive du checkpoint sans supprimer l’état sauvegardé.                                                   |

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
