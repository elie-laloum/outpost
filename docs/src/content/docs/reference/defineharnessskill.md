---
title: "defineHarnessSkill"
description: "defineHarnessSkill — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessSkill } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a skill: instructions and optional tools that a built-in harness lists by name and description in its system prompt. The model calls load_skill to read the instructions; calls to the skill's tools are denied until then.

[Complete example and detailed rules](../../guide/harness-context/).

## Parameters and properties

| Name                   | Type                                                               | Presence | Meaning                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `HarnessSkillOptions`                                              | Required | Skill name, description, instructions and optional tools.                                                                                                                    |
| `options.name`         | `string`                                                           | Required | Unique skill name of 1 to 64 letters, digits, underscores or hyphens, passed by the model to load_skill.                                                                     |
| `options.description`  | `string`                                                           | Required | Short description listed in the system instructions so the model knows when to load the skill.                                                                               |
| `options.instructions` | `HarnessInstructionSource`                                         | Required | Instructions returned when the skill is loaded: text or a resolver receiving the sandbox, signal and model.                                                                  |
| `options.tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools or toolsets of the skill. They are offered to the model with the other tools, but a call is denied until the skill is loaded; names must be unique across the harness. |

## Returns

`HarnessSkill`

## Signature

```ts
export declare function defineHarnessSkill(
  options: HarnessSkillOptions,
): HarnessSkill;
```

## Related contracts

- [HarnessSkill](../harnessskill/)
- [HarnessSkillOptions](../harnessskilloptions/)
