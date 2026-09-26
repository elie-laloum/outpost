---
title: "defineHarnessSkill"
description: "defineHarnessSkill — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. The contract may change before release.
:::

## Import

```ts
import { defineHarnessSkill } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a skill: instructions, and optionally tools, that a custom harness lists in its system instructions and the model loads with load_skill when needed. Skill tools are refused until their skill is loaded.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                   | Type                                                               | Presence | Meaning                                                                                                     |
| ---------------------- | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `options`              | `HarnessSkillOptions`                                              | Required | Skill name, description, instructions and optional tools.                                                   |
| `options.name`         | `string`                                                           | Required | Unique skill name the model passes to load_skill.                                                           |
| `options.description`  | `string`                                                           | Required | Short description listed in the system instructions so the model knows when to load the skill.              |
| `options.instructions` | `HarnessInstructionSource`                                         | Required | Instructions returned when the skill is loaded: text or a resolver receiving the sandbox, signal and model. |
| `options.tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools or toolsets enabled once the skill is loaded; their names must be unique across the harness.          |

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
