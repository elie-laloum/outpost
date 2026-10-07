---
title: "RunPass"
description: "RunPass — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunPass } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type     | Presence | Meaning                                                                             |
| ------- | -------- | -------- | ----------------------------------------------------------------------------------- |
| `pass`  | `number` | Required | Dispatch pass number within its observation scope.                                  |
| `usage` | `Usage`  | Required | Latest per-pass tokens, adding deltas and replacing cumulative or summary counters. |

## Signature

```ts
export interface RunPass {
  readonly pass: number;
  readonly usage: Usage;
}
```

## Related contracts

- [Usage](../usage/)
