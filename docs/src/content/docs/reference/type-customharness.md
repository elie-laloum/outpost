---
title: "Harness"
description: "Harness — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Harness } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                       | Presence | Meaning                                                                                                                                                                                       |
| --------------- | ------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routing`       | `HarnessModelRouting \| undefined`         | Optional | Validated per-step routing configuration retained by the built-in harness.                                                                                                                    |
| `kind`          | `"custom"`                                 | Required | Execution discriminator: custom.                                                                                                                                                              |
| `modelProvider` | `ModelProvider`                            | Required | Model provider called for every step and summary request.                                                                                                                                     |
| `instructions`  | `readonly HarnessInstructions[]`           | Required | Instruction sources resolved at the start of each turn, followed by the skill catalog when skills are set.                                                                                    |
| `tools`         | `readonly HarnessTool<unknown>[]`          | Required | Flattened tool list sent to the model: declared tools, then skill tools and load_skill. MCP tools are added when a turn starts.                                                               |
| `limits`        | `ResolvedHarnessLimits`                    | Required | Normalized limits; maxSteps defaults to 100.                                                                                                                                                  |
| `toolExecution` | `Required<HarnessToolExecution>`           | Required | Tool execution settings with defaults applied: concurrency 4, deadlineMs 300000, onError return-to-model.                                                                                     |
| `hooks`         | `readonly HarnessHook<HarnessHookPhase>[]` | Required | Frozen hooks of the harness.                                                                                                                                                                  |
| `permissions`   | `HarnessPermissions \| undefined`          | Optional | Permission rules evaluated before before-tool hooks, when set.                                                                                                                                |
| `context`       | `HarnessContextStrategy \| undefined`      | Optional | Context strategy of the harness, when set.                                                                                                                                                    |
| `conversations` | `false \| ConversationStore \| undefined`  | Optional | Configured conversation store, or false when recording is disabled; absent means the default store.                                                                                           |
| `skills`        | `readonly HarnessSkill[]`                  | Required | Skills of the harness; their tools and load_skill are part of the tool list.                                                                                                                  |
| `cache`         | `boolean`                                  | Required | Whether each request asks the provider to cache the conversation prefix.                                                                                                                      |
| `mcpServers`    | `McpServers \| undefined`                  | Optional | Validated MCP servers started for each turn, when set.                                                                                                                                        |
| `profile`       | `AgentProfile \| undefined`                | Optional | Validated, frozen portable declaration retained by this harness; runtime permissions derived from allowedTools restrict supported built-in tool names and exact shell commands in every turn. |

## Signature

```ts
export interface Harness {
  readonly routing?: HarnessModelRouting;
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly instructions: readonly HarnessInstructions[];
  readonly tools: readonly HarnessTool[];
  readonly limits: ResolvedHarnessLimits;
  readonly toolExecution: Required<HarnessToolExecution>;
  readonly hooks: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills: readonly HarnessSkill[];
  readonly cache: boolean;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
}
```

## Related contracts

- [AgentProfile](../agentprofile/)
- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructions](../harnessinstructions/)
- [HarnessModelRouting](../harnessmodelrouting/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessSkill](../harnessskill/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [McpServers](../mcpservers/)
- [ModelProvider](../modelprovider/)
- [ResolvedHarnessLimits](../support-resolvedharnesslimits/)
