---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type      | Presence | Meaning                                                                                               |
| ------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `head`        | `string`  | Required | HEAD commit of the checkout.                                                                          |
| `branch`      | `string`  | Required | Current branch name, or HEAD when detached.                                                           |
| `fingerprint` | `string`  | Required | SHA-256 of HEAD, the uncommitted diff and untracked files, compared across snapshots to detect edits. |
| `dirty`       | `boolean` | Required | True when tracked or untracked changes exist outside .outpost.                                        |

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
