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

| Name              | Type                                 | Presence | Meaning                                                                                                                                                                                       |
| ----------------- | ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`          | `"conflict" \| "clean" \| "blocked"` | Required | clean when the commits merge without conflict, conflict with the paths in conflicts, blocked with a reason. Nothing is merged.                                                                |
| `host`            | `SpeculativeHostSnapshot`            | Required | Host snapshot taken at the start of the check; its head is the commit tested.                                                                                                                 |
| `candidateCommit` | `string \| undefined`                | Optional | Candidate commit tested against host.head; absent when blocked.                                                                                                                               |
| `conflicts`       | `readonly string[]`                  | Required | Conflicting paths reported by git merge-tree; empty unless status is conflict.                                                                                                                |
| `reason`          | `string \| undefined`                | Optional | Why the check is blocked: uncommitted changes, detached HEAD, a moved branch, a repository that changed during the check, or a Git failure such as a version without merge-tree --write-tree. |

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
