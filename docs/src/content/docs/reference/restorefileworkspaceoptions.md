---
title: "RestoreFileWorkspaceOptions"
description: "RestoreFileWorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RestoreFileWorkspaceOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                                                                                                                                         | Presence | Meaning                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `runtime`   | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optional | Control directory and logical namespace, separate from the workspace files.                                             |
| `retention` | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace. |
| `portable`  | `boolean \| undefined`                                                                                                                                                                                       | Optional | Restore a verified snapshot into a new owned materialization; mounted sources must remain accessible and unchanged.     |
| `recover`   | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.               |

## Signature

```ts
export interface RestoreFileWorkspaceOptions {
  readonly runtime?: WorkspaceRuntimeOptions;
  readonly retention?: WorkspaceRetention;
  readonly portable?: boolean;
  readonly recover?: {
    readonly processesStopped: true;
    readonly expectedRevision?: string;
    readonly allocationReleased?: true;
    readonly adoptInterruptedFiles?: boolean;
    readonly adoptMountedSource?: boolean;
  };
}
```

## Related contracts

- [WorkspaceRetention](../workspaceretention/)
- [WorkspaceRuntimeOptions](../workspaceruntimeoptions/)
