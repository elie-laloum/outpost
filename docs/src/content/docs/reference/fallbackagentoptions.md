---
title: "FallbackAgentOptions"
description: "FallbackAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackAgentOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name | Type                         | Presence | Meaning                                                                                                                                        |
| ---- | ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `on` | `readonly FallbackTrigger[]` | Required | Failure categories that move to the next candidate: quota, unavailable or both, without repetition. Required so the policy is always explicit. |

## Signature

```ts
export interface FallbackAgentOptions {
  /** Failure categories that hand the dispatch to the next candidate. */
  readonly on: readonly FallbackTrigger[];
}
```

## Related contracts

- [FallbackTrigger](../fallbacktrigger/)
