---
title: "FallbackCandidate"
description: "FallbackCandidate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackCandidate } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                  | Presence | Meaning                                                                                                   |
| ------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `index` | `number`              | Required | Zero-based position of the candidate in FallbackAgent.agents.                                             |
| `name`  | `string`              | Required | Adapter name of the candidate, such as claude, codex, custom or replay.                                   |
| `model` | `string \| undefined` | Optional | Model name selected on the candidate; absent when a CLI keeps its native default, and for a replay agent. |

## Signature

```ts
export interface FallbackCandidate {
  /** Zero-based position in FallbackAgent.agents. */
  readonly index: number;
  readonly name: string;
  readonly model?: string;
}
```
