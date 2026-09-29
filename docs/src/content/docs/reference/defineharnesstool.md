---
title: "defineHarnessTool"
description: "defineHarnessTool — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a tool a built-in harness offers to the model. Validates the name, description and input schema immediately and returns a frozen definition whose validate() checks model arguments before execute() runs.

[Complete example and detailed rules](../../guide/harness-tools/).

## Parameters and properties

| Name                  | Type                                                                               | Presence | Meaning                                                                                                                                                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessToolOptions<Input>`                                                        | Required | Tool name, description, input schema, read-only flag, resources function and execute function. Unknown keys are rejected.                                                                                                                                                                    |
| `options.name`        | `string`                                                                           | Required | Unique tool name of 1 to 64 letters, digits, underscores or hyphens, shown to the model.                                                                                                                                                                                                     |
| `options.description` | `string`                                                                           | Required | Nonempty explanation the model reads to decide when and how to call the tool.                                                                                                                                                                                                                |
| `options.input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Required | Input schema: a JSON Schema object checked with the built-in subset (type, properties, required, additionalProperties, items, enum, const and length, range and item-count bounds), or a Standard Schema that exports JSON Schema, such as Zod 4. Other keywords are rejected at definition. |
| `options.readOnly`    | `boolean \| undefined`                                                             | Optional | Marks a tool without side effects, default false. Read-only calls can run in parallel, and response repair turns keep only read-only tools.                                                                                                                                                  |
| `options.resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optional | Describe the paths and command of a validated input so permission rules can match them. Custom tools without it only match by name.                                                                                                                                                          |
| `options.execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Runs the call with validated input and its context, and returns text or { content, isError }. A thrown error is handled by toolExecution.onError; results over 100000 characters are cut before reaching the model.                                                                          |

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
