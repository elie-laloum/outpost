---
title: "AgentHarness"
description: "AgentHarness — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentHarness } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name            | Type                                       | Presence          | Meaning                                                                                                                                                                                       |
| --------------- | ------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"cli" \| "custom"`                        | Required          | Execution discriminator: cli or custom.                                                                                                                                                       |
| `bind`          | `(model?: AgentModel) => AgentAdapter`     | Variant-dependent | Build the adapter for an optional model without starting the CLI; createAgent() calls it. Unsupported model settings, authentication forms and MCP options throw here.                        |
| `routing`       | `HarnessModelRouting \| undefined`         | Variant-dependent | Validated per-step routing configuration retained by the built-in harness.                                                                                                                    |
| `modelProvider` | `ModelProvider`                            | Variant-dependent | Model provider called for every step and summary request.                                                                                                                                     |
| `instructions`  | `readonly HarnessInstructions[]`           | Variant-dependent | Instruction sources resolved at the start of each turn, followed by the skill catalog when skills are set.                                                                                    |
| `tools`         | `readonly HarnessTool<unknown>[]`          | Variant-dependent | Flattened tool list sent to the model: declared tools, then skill tools and load_skill. MCP tools are added when a turn starts.                                                               |
| `limits`        | `ResolvedHarnessLimits`                    | Variant-dependent | Normalized limits; maxSteps defaults to 100.                                                                                                                                                  |
| `toolExecution` | `Required<HarnessToolExecution>`           | Variant-dependent | Tool execution settings with defaults applied: concurrency 4, deadlineMs 300000, onError return-to-model.                                                                                     |
| `hooks`         | `readonly HarnessHook<HarnessHookPhase>[]` | Variant-dependent | Frozen hooks of the harness.                                                                                                                                                                  |
| `permissions`   | `HarnessPermissions \| undefined`          | Variant-dependent | Permission rules evaluated before before-tool hooks, when set.                                                                                                                                |
| `context`       | `HarnessContextStrategy \| undefined`      | Variant-dependent | Context strategy of the harness, when set.                                                                                                                                                    |
| `conversations` | `false \| ConversationStore \| undefined`  | Variant-dependent | Configured conversation store, or false when recording is disabled; absent means the default store.                                                                                           |
| `skills`        | `readonly HarnessSkill[]`                  | Variant-dependent | Skills of the harness; their tools and load_skill are part of the tool list.                                                                                                                  |
| `cache`         | `boolean`                                  | Variant-dependent | Whether each request asks the provider to cache the conversation prefix.                                                                                                                      |
| `mcpServers`    | `McpServers \| undefined`                  | Variant-dependent | Validated MCP servers started for each turn, when set.                                                                                                                                        |
| `profile`       | `AgentProfile \| undefined`                | Variant-dependent | Validated, frozen portable declaration retained by this harness; runtime permissions derived from allowedTools restrict supported built-in tool names and exact shell commands in every turn. |

## Signature

```ts
export type AgentHarness = CliHarness | Harness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [Harness](../type-customharness/)
