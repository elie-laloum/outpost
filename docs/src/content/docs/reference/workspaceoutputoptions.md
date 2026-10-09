---
title: "WorkspaceOutputOptions"
description: "WorkspaceOutputOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceOutputOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                   | Presence | Meaning                                                                                                  |
| --------------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `paths`         | `readonly string[]`    | Required | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                   |
| `destination`   | `string`               | Required | Host destination preserving selected relative paths; overlap with an active writable source is refused.  |
| `policy`        | `"create" \| "update"` | Required | create requires a new destination; update uses a captured expected state before any replacement.         |
| `deleteMissing` | `boolean \| undefined` | Optional | Defaults to false; deletes only initially selected destination files missing from corresponding outputs. |

## Signature

```ts
export interface WorkspaceOutputOptions {
  readonly paths: readonly string[];
  readonly destination: string;
  readonly policy: "create" | "update";
  readonly deleteMissing?: boolean;
}
```
