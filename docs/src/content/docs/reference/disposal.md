---
title: "Disposal"
description: "Disposal — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Disposal } from "@elie-laloum/outpost";
```

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
