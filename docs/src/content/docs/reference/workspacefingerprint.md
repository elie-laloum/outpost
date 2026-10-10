---
title: "workspaceFingerprint"
description: "workspaceFingerprint — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { workspaceFingerprint } from "@elie-laloum/outpost";
```

## Purpose and behavior

Computes a canonical file manifest fingerprint without Git, retaining paths, content, types, modes, links and selection identity.

[Complete example and detailed rules](../../guide/working-with-files/).

## Parameters and properties

| Name        | Type                             | Presence | Meaning                                                                                    |
| ----------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `workspace` | `string \| FileWorkspace`        | Required | Open workspace borrowed for this operation; its caller remains responsible for closing it. |
| `paths`     | `readonly string[] \| undefined` | Optional | Explicit relative path selection; copy selection does not implicitly apply .gitignore.     |

## Returns

`Promise<string>`

## Signature

```ts
export declare function workspaceFingerprint(
  workspace: FileWorkspace | string,
  paths?: readonly string[],
): Promise<string>;
```

## Related contracts

- [FileWorkspace](../fileworkspace/)
