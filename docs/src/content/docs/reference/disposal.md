---
title: "Disposal"
description: "Disposal — Outpost API"
sidebar:
  order: 10
---

Public contract for **Disposal**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { Disposal } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                        |
| ------------------- | --------------------- | -------- | ---------------------------------------------- |
| `retainedDirectory` | `string \| undefined` | Optional | Workspace retained for inspection or recovery. |

## Signature

```ts
export interface Disposal {
  readonly retainedDirectory?: string;
}
```
