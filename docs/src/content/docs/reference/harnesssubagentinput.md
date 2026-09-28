---
title: "HarnessSubagentInput"
description: "HarnessSubagentInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSubagentInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                                                            |
| -------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `prompt` | `string` | Required | Nonempty task text supplied by the parent model. Parent message history is not copied into the child conversation. |

## Signature

```ts
export interface HarnessSubagentInput {
  readonly prompt: string;
}
```
