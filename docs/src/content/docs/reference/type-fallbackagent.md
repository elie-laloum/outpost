---
title: "FallbackAgent"
description: "FallbackAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackAgent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                         | Presence | Meaning                                                                                                  |
| -------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `kind`   | `"fallback"`                 | Required | Discriminator: fallback, for an ordered list of candidates rather than a single agent.                   |
| `agents` | `readonly Agent[]`           | Required | Frozen copy of the candidates, in the order they are tried; at least two, none of them a fallback agent. |
| `on`     | `readonly FallbackTrigger[]` | Required | Frozen copy of the failure categories that move to the next candidate; every other failure is rethrown.  |

## Signature

```ts
export interface FallbackAgent {
  readonly kind: "fallback";
  /** Candidates in the order they are tried. */
  readonly agents: readonly Agent[];
  readonly on: readonly FallbackTrigger[];
}
```

## Related contracts

- [Agent](../type-agent/)
- [FallbackTrigger](../fallbacktrigger/)
