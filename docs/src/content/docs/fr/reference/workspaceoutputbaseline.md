---
title: "WorkspaceOutputBaseline"
description: "WorkspaceOutputBaseline — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOutputBaseline } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                            | Présence | Rôle                                                                                                       |
| ---------- | ------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `options`  | `WorkspaceOutputOptions`        | Requis   | Options de publication dont l’état de destination a été capturé pour détecter les changements concurrents. |
| `expected` | `readonly WorkspaceFileEntry[]` | Requis   | Manifest de destination capturé avant exécution et utilisé pour détecter les modifications concurrentes.   |

## Signature

```ts
export interface WorkspaceOutputBaseline {
  readonly options: WorkspaceOutputOptions;
  readonly expected: readonly WorkspaceFileEntry[];
}
```

## Contrats associés

- [WorkspaceFileEntry](../workspacefileentry/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
