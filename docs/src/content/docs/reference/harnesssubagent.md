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
| `subagent`    | `CustomAgent`                                                                                     | Required | Child agent run in the parent's borrowed sandbox, with ancestor permissions added to its own and its tokens counted in every ancestor budget.                       |
| `workspace`   | `"git" \| undefined`                                                                              | Optional | Declares a required Git workspace; file execution refuses this tool before acquisition.                                                                             |
| `kind`        | `"tool"`                                                                                          | Required | Definition discriminator: tool.                                                                                                                                     |
| `name`        | `string`                                                                                          | Required | Unique tool name shown to the model.                                                                                                                                |
| `description` | `string`                                                                                          | Required | Explanation sent to the model with the tool.                                                                                                                        |
| `readOnly`    | `boolean`                                                                                         | Required | Always false: delegations are serialized even if the child only declares read-only tools.                                                                           |
| `inputSchema` | `Readonly<Record<string, unknown>>`                                                               | Required | Fixed JSON object schema requiring one nonempty prompt string and rejecting additional properties.                                                                  |
| `validate`    | `(value: unknown) => Promise<ToolValidation<HarnessSubagentInput>>`                               | Required | Validate the parent model’s delegation input against the fixed prompt schema before invoking the child.                                                             |
| `resources`   | `(input: HarnessSubagentInput) => ToolResources`                                                  | Required | Always empty: the delegation call matches permission rules by tool name only. Each child tool call is checked against the child's and every ancestor's permissions. |
| `execute`     | `(input: HarnessSubagentInput, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Required | Throws code configuration when called directly: only the harness runtime runs a subagent, supplying cancellation, budgets, permissions and the child transcript.    |

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
