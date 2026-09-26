---
title: "HarnessSkillOptions"
description: "HarnessSkillOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessSkillOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                               | Presence | Meaning                                                                                                     |
| -------------- | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `name`         | `string`                                                           | Required | Unique skill name the model passes to load_skill.                                                           |
| `description`  | `string`                                                           | Required | Short description listed in the system instructions so the model knows when to load the skill.              |
| `instructions` | `HarnessInstructionSource`                                         | Required | Instructions returned when the skill is loaded: text or a resolver receiving the sandbox, signal and model. |
| `tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools or toolsets enabled once the skill is loaded; their names must be unique across the harness.          |

## Signature

```ts
export interface HarnessSkillOptions {
  readonly name: string;
  readonly description: string;
  readonly instructions: HarnessInstructionSource;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
}
```

## Related contracts

- [HarnessInstructionSource](../harnessinstructionsource/)
- [HarnessTool](../harnesstool/)
- [HarnessToolset](../harnesstoolset/)
