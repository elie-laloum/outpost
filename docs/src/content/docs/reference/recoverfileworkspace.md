---
title: "recoverFileWorkspace"
description: "recoverFileWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverFileWorkspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Claims an inspected abandoned file workspace after explicit stopped-process authorization and verified allocation release. File or mounted-source adoption is separate and explicit.

[Complete example and detailed rules](../../guide/resuming-file-workspaces/).

## Parameters and properties

| Name                       | Type                                                                                                                                                                                                         | Presence | Meaning                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `record`                   | `FileWorkspaceRecord`                                                                                                                                                                                        | Required | Versioned workspace description retaining ownership, settled generation and recovery references.                          |
| `options`                  | `FileWorkspaceRecoveryOptions`                                                                                                                                                                               | Required | Inspected revision, stopped-process confirmations and explicit adoption choices for interrupted files or a changed mount. |
| `options.expectedRevision` | `string`                                                                                                                                                                                                     | Required | Revision obtained by inspection; recovery refuses a changed persisted record.                                             |
| `options.processesStopped` | `true`                                                                                                                                                                                                       | Required | Explicit assertion that the prior owner and its processes have stopped; never inferred from heartbeat expiry.             |
| `options.sandboxProvider`  | `SandboxProvider \| undefined`                                                                                                                                                                               | Optional | Execution provider with the required file binding capability; legacy providers remain usable for Git.                     |
| `options.runtime`          | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optional | Control directory and logical namespace, separate from the workspace files.                                               |
| `options.retention`        | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace.   |
| `options.portable`         | `boolean \| undefined`                                                                                                                                                                                       | Optional | Restore a verified snapshot into a new owned materialization; mounted sources must remain accessible and unchanged.       |
| `options.recover`          | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.                 |

## Returns

`Promise<FileWorkspace>`

## Signature

```ts
export declare function recoverFileWorkspace(
  record: FileWorkspaceRecord,
  options: FileWorkspaceRecoveryOptions,
): Promise<FileWorkspace>;
```

## Related contracts

- [FileWorkspace](../fileworkspace/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
- [FileWorkspaceRecoveryOptions](../fileworkspacerecoveryoptions/)
