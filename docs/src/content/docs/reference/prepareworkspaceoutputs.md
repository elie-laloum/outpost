---
title: "prepareWorkspaceOutputs"
description: "prepareWorkspaceOutputs — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { prepareWorkspaceOutputs } from "@elie-laloum/outpost";
```

## Purpose and behavior

Captures expected destination manifests before execution for protected publication, without writing outputs.

[Complete example and detailed rules](../../guide/workspaces/).

## Parameters and properties

| Name        | Type                                | Presence | Meaning                                                                                    |
| ----------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `workspace` | `FileWorkspace`                     | Required | Open workspace borrowed for this operation; its caller remains responsible for closing it. |
| `outputs`   | `readonly WorkspaceOutputOptions[]` | Required | Declared protected publications performed only after successful work and sandbox closure.  |

## Returns

`Promise<void>`

## Signature

```ts
export declare function prepareWorkspaceOutputs(
  workspace: FileWorkspace,
  outputs: readonly WorkspaceOutputOptions[],
): Promise<void>;
```

## Related contracts

- [FileWorkspace](../fileworkspace/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
