---
title: "publishWorkspaceOutputs"
description: "publishWorkspaceOutputs — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { publishWorkspaceOutputs } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publishes selected settled files with exclusive creation or protected update. Failure attempts conditional rollback and preserves external edits and recovery evidence. Publication validates and stages all selected outputs before mutation, journals the operations through Transport and quarantines replaced entries on the destination filesystem. It is not an atomic tree replacement. Rollback restores only paths that still match the publication effects; concurrent edits and required backups remain available for explicit recovery. It requires settled files with no active sandbox operation and does not undo writable source-mount effects.

[Complete example and detailed rules](../../guide/publishing-files/).

## Parameters and properties

| Name          | Type                     | Presence | Meaning                                                                                    |
| ------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| `workspace`   | `FileWorkspace`          | Required | Open workspace borrowed for this operation; its caller remains responsible for closing it. |
| `declaration` | `WorkspaceOutputOptions` | Required | Relative output selection, destination and explicit create/update/deletion policy.         |
| `transporter` | `Transport \| undefined` | Optional | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading. |

## Returns

`Promise<WorkspacePublication>`

## Signature

```ts
export declare function publishWorkspaceOutputs(
  workspace: FileWorkspace,
  declaration: WorkspaceOutputOptions,
  transporter?: Transport,
): Promise<WorkspacePublication>;
```

## Related contracts

- [FileWorkspace](../fileworkspace/)
- [Transport](../transport/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
- [WorkspacePublication](../workspacepublication/)
