---
title: "WorkspaceRuntime"
description: "WorkspaceRuntime — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceRuntime } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                                                                 |
| ----------- | -------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `directory` | `string` | Requis   | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable. |
| `namespace` | `string` | Requis   | Namespace logique du projet ; une valeur explicite est exigée pour la conservation portable.         |

## Signature

```ts
export interface WorkspaceRuntime {
  readonly directory: string;
  readonly namespace: string;
}
```
