---
title: "HarnessSubagent"
description: "HarnessSubagent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSubagent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                                              | Presence | Meaning                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subagent`    | `CustomAgent`                                                                                     | Required | Explicit built-in child configuration, executed by the runtime in the parent’s borrowed sandbox with intersected permissions and cumulative ancestor token budgets. |
| `kind`        | `"tool"`                                                                                          | Required | Definition discriminator: tool.                                                                                                                                     |
| `name`        | `string`                                                                                          | Required | Unique tool name shown to the model.                                                                                                                                |
| `description` | `string`                                                                                          | Required | Explanation sent to the model with the tool.                                                                                                                        |
| `readOnly`    | `boolean`                                                                                         | Required | Always false: delegations are serialized even if the child only declares read-only tools.                                                                           |
| `inputSchema` | `Readonly<Record<string, unknown>>`                                                               | Required | Fixed JSON object schema requiring one nonempty prompt string and rejecting additional properties.                                                                  |
| `validate`    | `(value: unknown) => Promise<ToolValidation<HarnessSubagentInput>>`                               | Required | Validate the parent model’s delegation input against the fixed prompt schema before invoking the child.                                                             |
| `resources`   | `(input: HarnessSubagentInput) => ToolResources`                                                  | Required | The delegation call declares no paths or command. Each descendant tool declares its own resources, checked against both child and ancestor permissions.             |
| `execute`     | `(input: HarnessSubagentInput, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Direct execution is rejected; the harness runtime supplies cancellation, budgets, permissions and transcript ownership when this tool is called.                    |

## Signature

```ts
export interface HarnessSubagent extends HarnessTool<HarnessSubagentInput> {
  readonly subagent: CustomAgent;
}
```

## Related contracts

- [CustomAgent](../customagent/)
- [HarnessSubagentInput](../harnesssubagentinput/)
- [HarnessTool](../harnesstool/)
