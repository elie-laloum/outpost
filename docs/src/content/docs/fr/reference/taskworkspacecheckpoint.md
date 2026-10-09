---
title: "TaskWorkspaceCheckpoint"
description: "TaskWorkspaceCheckpoint — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskWorkspaceCheckpoint } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                                                        | Présence | Rôle                                                                                                   |
| ------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `read`  | `(key: string) => WorkflowJson \| undefined`                | Requis   | Lit la description JSON persistée de ressource pour une clé logique de workspace.                      |
| `write` | `(key: string, description: WorkflowJson) => Promise<void>` | Requis   | Persiste une description JSON de ressource settled sans allouer ni copier de fichiers dans le domaine. |

## Signature

```ts
export interface TaskWorkspaceCheckpoint {
  read(key: string): WorkflowJson | undefined;
  write(key: string, description: WorkflowJson): Promise<void>;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
