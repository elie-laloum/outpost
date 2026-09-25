---
title: "HarnessInput"
description: "HarnessInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                                                        |
| -------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `prompt` | `string` | Required | Prepared prompt for this execution pass, including rendered brief values and configured response instructions. |

## Signature

```ts
export interface HarnessInput {
  readonly prompt: string;
}
```
