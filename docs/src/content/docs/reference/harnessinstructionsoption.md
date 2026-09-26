---
title: "HarnessInstructionsOption"
description: "HarnessInstructionsOption — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessInstructionsOption } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                                                      | Presence          | Meaning                                                     |
| --------- | --------------------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `kind`    | `"instructions"`                                          | Variant-dependent | Definition discriminator: instructions.                     |
| `resolve` | `(context: HarnessInstructionContext) => Promise<string>` | Variant-dependent | Produce the instruction text for one turn from its context. |

## Signature

```ts
export type HarnessInstructionsOption =
  string | HarnessInstructions | readonly (string | HarnessInstructions)[];
```

## Related contracts

- [HarnessInstructions](../harnessinstructions/)
