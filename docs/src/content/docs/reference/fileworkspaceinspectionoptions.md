---
title: "FileWorkspaceInspectionOptions"
description: "FileWorkspaceInspectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceInspectionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                     | Presence | Meaning                                                                                    |
| ------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| `runtime`     | `WorkspaceRuntime`       | Required | Control directory and logical namespace, separate from the workspace files.                |
| `id`          | `string`                 | Required | Stable identifier of this resource, independent of its materialization path.               |
| `transporter` | `Transport \| undefined` | Optional | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading. |

## Signature

```ts
export interface FileWorkspaceInspectionOptions {
  readonly runtime: WorkspaceRuntime;
  readonly id: string;
  readonly transporter?: Transport;
}
```

## Related contracts

- [Transport](../transport/)
- [WorkspaceRuntime](../workspaceruntime/)
