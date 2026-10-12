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

<span id="outpost-instructions"></span>

## Instructions added by Outpost

Templates below preserve the English text sent to the model. `${…}` marks runtime substitutions, not brief template syntax.

When `createHarness({ skills })` receives a nonempty skill list, it adds this catalog to the system instructions after profile and harness instructions, before session-start hook additions:

```text
Skills are available on demand. Call load_skill with a skill name to read its instructions and enable its tools before using them:
- ${skill.name}: ${skill.description}
```

The name/description line repeats for each skill in declaration order. The injected `load_skill` tool has this model-visible description:

```text
Load a skill listed in the instructions: returns its instructions and enables its tools for the following steps.
```

Loading a skill resolves its instructions and returns them as tool output. If the skill has tools, the output is:

```text
${resolvedInstructions}

Tools now available: ${toolNames}.
```

`toolNames` joins the skill's tool names with `, `. Without tools, only `resolvedInstructions` is returned. Loading does not append the skill body to the system prompt.

Skill names, descriptions and instruction sources are configurable. The catalog introduction, loader description and tool-availability suffix are fixed; there is no override option. Omitting skills removes this machinery. Whether tools stay unlocked is determined from the effective history, so compaction can require loading a skill again.

Implementation: [skill.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/skill.ts) · [harness.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/harness.ts) · [harness-loop.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/harness-loop.ts).

## Signature

```ts
export declare function defineHarnessSkill(
  options: HarnessSkillOptions,
): HarnessSkill;
```

## Related contracts

- [HarnessSkill](../harnessskill/)
- [HarnessSkillOptions](../harnessskilloptions/)
