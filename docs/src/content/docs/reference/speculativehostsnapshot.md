---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type      | Presence | Meaning                                                                   |
| ------------- | --------- | -------- | ------------------------------------------------------------------------- |
| `head`        | `string`  | Required | Git HEAD commit recorded by the inspection or snapshot.                   |
| `branch`      | `string`  | Required | Name of the work branch used or observed during execution.                |
| `fingerprint` | `string`  | Required | Digest of the host checkout state used to detect changes during the race. |
| `dirty`       | `boolean` | Required | Whether tracked or untracked changes make the checkout dirty.             |

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
