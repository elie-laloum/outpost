---
title: "inspectFileWorkspace"
description: "inspectFileWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectFileWorkspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Reads the current versioned workspace record and revision without acquiring a sandbox or changing materialized files.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name                  | Type                             | Presence | Meaning                                                                                                  |
| --------------------- | -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`             | `FileWorkspaceInspectionOptions` | Required | Options selecting source, execution capabilities or inspected recovery preconditions for this operation. |
| `options.runtime`     | `WorkspaceRuntime`               | Required | Control directory and logical namespace, separate from the workspace files.                              |
| `options.id`          | `string`                         | Required | Stable identifier of this resource, independent of its materialization path.                             |
| `options.transporter` | `Transport \| undefined`         | Optional | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading.               |

## Returns

`Promise<FileWorkspaceInspection>`

## Signature

```ts
export declare function inspectFileWorkspace(
  options: FileWorkspaceInspectionOptions,
): Promise<FileWorkspaceInspection>;
```

## Related contracts

- [FileWorkspaceInspection](../fileworkspaceinspection/)
- [FileWorkspaceInspectionOptions](../fileworkspaceinspectionoptions/)
