---
title: "FileWorkflowCheckpointOptions"
description: "FileWorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                                                |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------------- |
| `directory` | `string` | Requis   | Dossier hôte utilisé pour persister les checkpoints et leurs verrous de possession. |

## Signature

```ts
export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory: string;
}
```
