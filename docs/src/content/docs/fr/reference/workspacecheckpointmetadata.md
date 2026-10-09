---
title: "WorkspaceCheckpointMetadata"
description: "WorkspaceCheckpointMetadata — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceCheckpointMetadata } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                     | Présence | Rôle                                                                                                                                  |
| ----------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `format`    | `1`                                      | Requis   | Version de l’enveloppe persistée ; les versions inconnues sont refusées.                                                              |
| `resources` | `Readonly<Record<string, WorkflowJson>>` | Requis   | Descriptions de ressources indexées par identité logique de tâche ; les écritures de comptabilité ne copient pas les fichiers actifs. |

## Signature

```ts
export interface WorkspaceCheckpointMetadata {
  readonly format: 1;
  readonly resources: Readonly<Record<string, WorkflowJson>>;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
