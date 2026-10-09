---
title: "WorkspaceRuntimeOptions"
description: "WorkspaceRuntimeOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceRuntimeOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                                      |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `directory` | `string \| undefined` | Optional | Control root; defaults to .outpost in the current directory for TypeScript, beside configuration for YAML 3. |
| `namespace` | `string \| undefined` | Optional | Logical project namespace; an explicit value is required for portable conservation.                          |

## Signature

```ts
export interface WorkspaceRuntimeOptions {
  readonly directory?: string;
  readonly namespace?: string;
}
```
