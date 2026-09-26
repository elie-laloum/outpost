---
title: "HarnessTool"
description: "HarnessTool — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Hooks, permissions, persisted conversations and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessTool } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                               | Presence | Meaning                                                                             |
| ------------- | ---------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `kind`        | `"tool"`                                                                           | Required | Definition discriminator: tool.                                                     |
| `name`        | `string`                                                                           | Required | Unique tool name shown to the model.                                                |
| `description` | `string`                                                                           | Required | Explanation sent to the model with the tool.                                        |
| `readOnly`    | `boolean`                                                                          | Required | Whether the tool may run concurrently with other read-only calls.                   |
| `inputSchema` | `Readonly<Record<string, unknown>>`                                                | Required | Frozen JSON Schema sent to the model, converted from a Standard Schema when needed. |
| `validate`    | `(value: unknown) => Promise<ToolValidation<Input>>`                               | Required | Check raw model arguments and return the typed value or a readable issue list.      |
| `execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Run the call with validated input and its context.                                  |

## Signature

```ts
export interface HarnessTool<Input = unknown> {
  readonly kind: "tool";
  readonly name: string;
  readonly description: string;
  readonly readOnly: boolean;
  readonly inputSchema: JsonSchema;
  validate(value: unknown): Promise<ToolValidation<Input>>;
  execute(
    input: Input,
    context: HarnessToolContext,
  ): ToolOutput | Promise<ToolOutput>;
}
```

## Related contracts

- [HarnessToolContext](../harnesstoolcontext/)
- [JsonSchema](../jsonschema/)
- [ToolOutput](../tooloutput/)
- [ToolValidation](../toolvalidation/)
