---
title: "DiffGuard"
description: "DiffGuard — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiffGuard } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                             | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                  |
| ----------------- | -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protectedPaths`  | `readonly string[] \| undefined` | Optional | Root-relative, case-sensitive patterns for paths forbidden in the final committed diff; omitted or empty disables path restrictions. Supports *, ? and ** with forward slashes; leading /, drive prefixes, backslashes, NUL and . or .. segments are refused. Checks both paths of a rename. Restored changes and uncommitted files are excluded.        |
| `maxChangedLines` | `number \| undefined`            | Optional | Maximum total added plus deleted text lines in the final committed diff; omitted disables this limit. Must be a nonnegative safe integer; equality is accepted and zero forbids textual changes. A detected rename without content changes adds zero lines. Binary changes are refused whenever this limit is set, because Git cannot count their lines. |

## Signature

```ts
export interface DiffGuard {
  readonly protectedPaths?: readonly string[];
  readonly maxChangedLines?: number;
}
```
