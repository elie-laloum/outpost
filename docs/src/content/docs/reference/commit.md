---
title: "Commit"
description: "Commit — Outpost API"
sidebar:
  order: 10
---

Public contract for **Commit**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { Commit } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name      | Type     | Presence | Meaning                                                                 |
| --------- | -------- | -------- | ----------------------------------------------------------------------- |
| `oid`     | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `subject` | `string` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface Commit {
  readonly oid: string;
  readonly subject: string;
}
```
