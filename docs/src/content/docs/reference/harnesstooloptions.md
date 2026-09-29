---
title: "HarnessToolOptions"
description: "HarnessToolOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessToolOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                               | Presence | Meaning                                                                                                                                                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                                                           | Required | Unique tool name of 1 to 64 letters, digits, underscores or hyphens, shown to the model.                                                                                                                                                                                                     |
| `description` | `string`                                                                           | Required | Nonempty explanation the model reads to decide when and how to call the tool.                                                                                                                                                                                                                |
| `input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Required | Input schema: a JSON Schema object checked with the built-in subset (type, properties, required, additionalProperties, items, enum, const and length, range and item-count bounds), or a Standard Schema that exports JSON Schema, such as Zod 4. Other keywords are rejected at definition. |
| `readOnly`    | `boolean \| undefined`                                                             | Optional | Marks a tool without side effects, default false. Read-only calls can run in parallel, and response repair turns keep only read-only tools.                                                                                                                                                  |
| `resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optional | Describe the paths and command of a validated input so permission rules can match them. Custom tools without it only match by name.                                                                                                                                                          |
| `execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Runs the call with validated input and its context, and returns text or { content, isError }. A thrown error is handled by toolExecution.onError; results over 100000 characters are cut before reaching the model.                                                                          |

## Signature

```ts
export interface HarnessToolOptions<Input> {
  readonly name: string;
  readonly description: string;
  readonly input: StandardJsonSchema<Input> | JsonSchema;
  readonly readOnly?: boolean;
  resources?(input: Input): ToolResources;
  execute(
    input: Input,
    context: HarnessToolContext,
  ): ToolOutput | Promise<ToolOutput>;
}
```

## Related contracts

- [HarnessToolContext](../harnesstoolcontext/)
- [JsonSchema](../jsonschema/)
- [StandardJsonSchema](../standardjsonschema/)
- [ToolOutput](../tooloutput/)
- [ToolResources](../toolresources/)
