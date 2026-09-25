---
title: "WorkspaceGitState"
description: "WorkspaceGitState — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name    | Type                                                           | Presence | Meaning                                                                 |
| ------- | -------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `state` | `"skipped" \| "registered" \| "unregistered" \| "unavailable"` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type WorkspaceGitState =
  | {
      readonly state: "registered";
      readonly head: string;
      readonly branch: string | null;
      readonly dirty: boolean;
      readonly locked: boolean;
    }
  | {
      readonly state: "unregistered";
    }
  | {
      readonly state: "skipped" | "unavailable";
      readonly reason: string;
    };
```
