---
title: "FileSelectionOptions"
description: "FileSelectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSelectionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                 | Presence | Meaning                                                                                                              |
| ----------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `selection` | `"git" \| "filesystem" \| undefined` | Optional | Defaults to git for legacy calls; filesystem performs bounded sandbox traversal without Git or .gitignore filtering. |

## Signature

```ts
export interface FileSelectionOptions {
  readonly selection?: "git" | "filesystem";
}
```
