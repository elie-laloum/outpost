---
title: "HarnessSkillOptions"
description: "HarnessSkillOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSkillOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                               | Presence | Meaning                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string`                                                           | Required | Unique skill name of 1 to 64 letters, digits, underscores or hyphens, passed by the model to load_skill.                                                                     |
| `description`  | `string`                                                           | Required | Short description listed in the system instructions so the model knows when to load the skill.                                                                               |
| `instructions` | `HarnessInstructionSource`                                         | Required | Instructions returned when the skill is loaded: text or a resolver receiving the sandbox, signal and model.                                                                  |
| `tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools or toolsets of the skill. They are offered to the model with the other tools, but a call is denied until the skill is loaded; names must be unique across the harness. |

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
