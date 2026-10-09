---
title: "FileWorkspaceRecoveryOptions"
description: "FileWorkspaceRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceRecoveryOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                                                                                                                                                                                         | Presence | Meaning                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `expectedRevision` | `string`                                                                                                                                                                                                     | Required | Revision obtained by inspection; recovery refuses a changed persisted record.                                           |
| `processesStopped` | `true`                                                                                                                                                                                                       | Required | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry.           |
| `sandboxProvider`  | `SandboxProvider \| undefined`                                                                                                                                                                               | Optional | Execution provider with the required file binding capability; legacy providers remain usable for Git.                   |
| `runtime`          | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optional | Control directory and logical namespace, separate from the workspace files.                                             |
| `retention`        | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace. |
| `portable`         | `boolean \| undefined`                                                                                                                                                                                       | Optional | Restore a verified snapshot into a new owned materialization; mounted sources must remain accessible and unchanged.     |
| `recover`          | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.               |

## Signature

```ts
export interface FileWorkspaceRecoveryOptions extends RestoreFileWorkspaceOptions {
  readonly expectedRevision: string;
  readonly processesStopped: true;
  readonly sandboxProvider?: SandboxProvider;
}
```

## Related contracts

- [RestoreFileWorkspaceOptions](../restorefileworkspaceoptions/)
- [SandboxProvider](../sandboxprovider/)
