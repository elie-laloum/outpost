---
title: "SpeculationIntegration"
description: "SpeculationIntegration — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationIntegration } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                 | Presence | Meaning                                                                                                                                                                                            |
| ----------------- | ------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`          | `"conflict" \| "clean" \| "blocked"` | Required | clean means a conflict-free merge of the recorded commits; conflict lists conflicting files; blocked reports dirty/detached or changing state and Git failures. This does not perform integration. |
| `host`            | `SpeculativeHostSnapshot`            | Required | Host snapshot used for this preflight; rerun the check if host state changes before integration.                                                                                                   |
| `candidateCommit` | `string \| undefined`                | Optional | Exact candidate commit tested against host.head when the preflight completes.                                                                                                                      |
| `conflicts`       | `readonly string[]`                  | Required | Paths reported by Git merge-tree for a conflicting merge; empty for clean or blocked checks.                                                                                                       |
| `reason`          | `string \| undefined`                | Optional | Explanation of a blocked preflight, including changed candidate refs or unavailable Git support.                                                                                                   |

## Signature

```ts
export interface SpeculationIntegration {
  readonly status: "clean" | "conflict" | "blocked";
  readonly host: SpeculativeHostSnapshot;
  readonly candidateCommit?: string;
  readonly conflicts: readonly string[];
  readonly reason?: string;
}
```

## Related contracts

- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
