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

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                                                     |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `directory` | `string` | Required | Absolute local materialization or source directory; it is not a portable resource identity. |
| `namespace` | `string` | Required | Logical project namespace; an explicit value is required for portable conservation.         |

## Signature

```ts
export interface WorkspaceRuntime {
  readonly directory: string;
  readonly namespace: string;
}
```
