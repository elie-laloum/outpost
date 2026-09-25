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

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                              |
| ----------- | -------- | -------- | -------------------------------------------------------------------- |
| `directory` | `string` | Required | Host directory used to persist checkpoint files and ownership locks. |

## Signature

```ts
export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory: string;
}
```
