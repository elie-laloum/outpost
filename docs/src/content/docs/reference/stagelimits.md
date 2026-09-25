---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 10
---

Public contract for **StageLimits**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                 |
| ----------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `copyMs`    | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `gitMs`     | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `collectMs` | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `mergeMs`   | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
