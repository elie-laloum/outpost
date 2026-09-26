---
title: "HarnessToolOptions"
description: "HarnessToolOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Persisted conversations, built-in toolsets and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessToolOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                               | Presence | Meaning                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                                                           | Required | Unique tool name of 1 to 64 letters, digits, underscores or hyphens, shown to the model.                                                                             |
| `description` | `string`                                                                           | Required | Nonempty explanation the model reads to decide when and how to call the tool.                                                                                        |
| `input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Required | Input schema: a JSON Schema object validated by the built-in subset, or a Standard Schema that exposes JSON Schema, such as Zod 4, whose validator checks the input. |
| `readOnly`    | `boolean \| undefined`                                                             | Optional | Mark tools without side effects so they can run concurrently; defaults to false.                                                                                     |
| `resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optional | Describe the paths and command of a validated input so permission rules can match them. Custom tools without it only match by name.                                  |
| `execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Run the call with validated input and its context. Return text, or { content, isError } to report a failure the model can react to.                                  |

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
