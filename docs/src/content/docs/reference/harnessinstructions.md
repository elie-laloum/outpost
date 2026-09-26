---
title: "HarnessInstructions"
description: "HarnessInstructions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessInstructions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                      | Presence | Meaning                                                     |
| --------- | --------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `kind`    | `"instructions"`                                          | Required | Definition discriminator: instructions.                     |
| `resolve` | `(context: HarnessInstructionContext) => Promise<string>` | Required | Produce the instruction text for one turn from its context. |

## Signature

```ts
export interface HarnessInstructions {
  readonly kind: "instructions";
  resolve(context: HarnessInstructionContext): Promise<string>;
}
```

## Related contracts

- [HarnessInstructionContext](../harnessinstructioncontext/)
