---
title: "HarnessSkill"
description: "HarnessSkill — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessSkill } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                              | Presence | Meaning                                         |
| -------------- | --------------------------------- | -------- | ----------------------------------------------- |
| `kind`         | `"skill"`                         | Required | Definition discriminator: skill.                |
| `name`         | `string`                          | Required | Unique skill name.                              |
| `description`  | `string`                          | Required | Description listed in the system instructions.  |
| `instructions` | `HarnessInstructions`             | Required | Instructions resolved when the skill is loaded. |
| `tools`        | `readonly HarnessTool<unknown>[]` | Required | Flattened tools enabled by the skill.           |

## Signature

```ts
export interface HarnessSkill {
  readonly kind: "skill";
  readonly name: string;
  readonly description: string;
  readonly instructions: HarnessInstructions;
  readonly tools: readonly HarnessTool[];
}
```

## Related contracts

- [HarnessInstructions](../harnessinstructions/)
- [HarnessTool](../harnesstool/)
