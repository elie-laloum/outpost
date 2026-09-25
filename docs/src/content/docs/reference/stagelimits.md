---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                           |
| ----------- | --------------------- | -------- | ----------------------------------------------------------------- |
| `copyMs`    | `number \| undefined` | Optional | Deadline for copying workspace inputs, in milliseconds.           |
| `gitMs`     | `number \| undefined` | Optional | Deadline for Git preparation commands, in milliseconds.           |
| `collectMs` | `number \| undefined` | Optional | Deadline for collecting commits after execution, in milliseconds. |
| `mergeMs`   | `number \| undefined` | Optional | Deadline for integrating the work branch, in milliseconds.        |

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
