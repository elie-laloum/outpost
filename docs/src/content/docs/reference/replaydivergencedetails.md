---
title: "ReplayDivergenceDetails"
description: "ReplayDivergenceDetails — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayDivergenceDetails } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                   | Presence | Meaning                                                                                     |
| ---------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `kind`     | `ReplayDivergenceKind` | Required | Divergence category: prompt, baseline, tree, exhausted or unrecorded.                       |
| `turn`     | `number`               | Required | One-based index of the recorded turn being replayed.                                        |
| `expected` | `string \| undefined`  | Optional | Recorded value: prompt text, tree ID or the reason the workspace commits were not recorded. |
| `actual`   | `string \| undefined`  | Optional | Value observed during replay: rendered prompt, tree ID or Git apply error.                  |
| `commit`   | `string \| undefined`  | Optional | Recorded commit whose patch or tree diverged, for tree divergences.                         |

## Signature

```ts
export interface ReplayDivergenceDetails {
  readonly kind: ReplayDivergenceKind;
  readonly turn: number;
  readonly expected?: string;
  readonly actual?: string;
  readonly commit?: string;
}
```

## Related contracts

- [ReplayDivergenceKind](../replaydivergencekind/)
