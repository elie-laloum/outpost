---
title: "defineHarnessTool"
description: "defineHarnessTool — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. The contract may change before release.
:::

## Import

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a tool the engine can offer to the model. Validates the name, description and input schema immediately and returns a frozen definition whose validate() checks model arguments before execute() runs.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                  | Type                                                                               | Presence | Meaning                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessToolOptions<Input>`                                                        | Required | Tool name, description, input schema, read-only flag and execute function.                                                                                           |
| `options.name`        | `string`                                                                           | Required | Unique tool name of 1 to 64 letters, digits, underscores or hyphens, shown to the model.                                                                             |
| `options.description` | `string`                                                                           | Required | Nonempty explanation the model reads to decide when and how to call the tool.                                                                                        |
| `options.input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Required | Input schema: a JSON Schema object validated by the built-in subset, or a Standard Schema that exposes JSON Schema, such as Zod 4, whose validator checks the input. |
| `options.readOnly`    | `boolean \| undefined`                                                             | Optional | Mark tools without side effects so they can run concurrently; defaults to false.                                                                                     |
| `options.resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optional | Describe the paths and command of a validated input so permission rules can match them. Custom tools without it only match by name.                                  |
| `options.execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Run the call with validated input and its context. Return text, or { content, isError } to report a failure the model can react to.                                  |

## Returns

`HarnessTool<Input>`

## Signature

```ts
export declare function defineHarnessTool<Input>(
  options: HarnessToolOptions<Input>,
): HarnessTool<Input>;
```

## Related contracts

- [HarnessTool](../harnesstool/)
- [HarnessToolOptions](../harnesstooloptions/)
