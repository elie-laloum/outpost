---
title: "restoreFileWorkspace"
description: "restoreFileWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { restoreFileWorkspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Restores an inspected settled file resource locally, or a verified portable snapshot with an explicit Transport. Missing or replaced local work is refused.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name                | Type                                                                                                                                                                                                         | Presence | Meaning                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `record`            | `FileWorkspaceRecord`                                                                                                                                                                                        | Required | Versioned workspace description retaining ownership, settled generation and recovery references.                        |
| `options`           | `RestoreFileWorkspaceOptions \| undefined`                                                                                                                                                                   | Optional | Options selecting source, execution capabilities or inspected recovery preconditions for this operation.                |
| `options.runtime`   | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optional | Control directory and logical namespace, separate from the workspace files.                                             |
| `options.retention` | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace. |
| `options.portable`  | `boolean \| undefined`                                                                                                                                                                                       | Optional | Restore a verified snapshot into a new owned materialization; mounted sources must remain accessible and unchanged.     |
| `options.recover`   | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.               |

## Returns

`Promise<FileWorkspace>`

## Signature

```ts
export declare function restoreFileWorkspace(
  record: FileWorkspaceRecord,
  options?: RestoreFileWorkspaceOptions,
): Promise<FileWorkspace>;
```

## Related contracts

- [FileWorkspace](../fileworkspace/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
- [RestoreFileWorkspaceOptions](../restorefileworkspaceoptions/)
