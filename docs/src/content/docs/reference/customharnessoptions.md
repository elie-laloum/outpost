---
title: "CustomHarnessOptions"
description: "CustomHarnessOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import type { CustomHarnessOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                                              | Presence | Meaning                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelProvider` | `ModelProvider`                                                                   | Required | Request transport the engine calls for each step; it validates the agent model when the agent is composed.                                                                |
| `instructions`  | `HarnessInstructionsOption \| undefined`                                          | Optional | System instructions as text, a defineHarnessInstructions() result or a list of both. Resolved at each turn and joined with blank lines; empty results are skipped.        |
| `tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined`                | Optional | Tools and toolsets the model may call. Nested toolsets are flattened; names must be unique across the harness.                                                            |
| `limits`        | `HarnessLimits \| undefined`                                                      | Optional | Bounds on steps, tool calls and token usage. Reaching one fails the turn with code limit.                                                                                 |
| `toolExecution` | `HarnessToolExecution \| undefined`                                               | Optional | Tool concurrency, per-call deadline and error policy.                                                                                                                     |
| `hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[] \| undefined` | Optional | Hooks from defineHarnessHook, run in declaration order within each phase.                                                                                                 |
| `permissions`   | `HarnessPermissions \| undefined`                                                 | Optional | Rules from defineHarnessPermissions, evaluated before before-tool hooks.                                                                                                  |
| `context`       | `HarnessContextStrategy \| undefined`                                             | Optional | Strategy that can rewrite the history before each model request, such as truncateToolResults() or summarizeHistory().                                                     |
| `conversations` | `false \| ConversationStore \| undefined`                                         | Optional | Store for turn transcripts; defaults to harnessConversations(). Use transportConversations("harness", …) for remote storage or false to disable continuation and repairs. |
| `skills`        | `readonly HarnessSkill[] \| undefined`                                            | Optional | Skills listed in the system instructions and loaded on demand through the load_skill tool.                                                                                |
| `cache`         | `boolean \| undefined`                                                            | Optional | Ask the provider to cache the conversation prefix; defaults to true. OpenAI caches stable prefixes automatically.                                                         |

## Signature

```ts
export interface CustomHarnessOptions {
  readonly modelProvider: ModelProvider;
  readonly instructions?: HarnessInstructionsOption;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
  readonly limits?: HarnessLimits;
  readonly toolExecution?: HarnessToolExecution;
  readonly hooks?: readonly HarnessHook[];
  readonly permissions?: HarnessPermissions;
  readonly context?: HarnessContextStrategy;
  readonly conversations?: ConversationStore | false;
  readonly skills?: readonly HarnessSkill[];
  readonly cache?: boolean;
}
```

## Related contracts

- [ConversationStore](../conversationstore/)
- [HarnessContextStrategy](../harnesscontextstrategy/)
- [HarnessHook](../harnesshook/)
- [HarnessInstructionsOption](../harnessinstructionsoption/)
- [HarnessLimits](../harnesslimits/)
- [HarnessPermissions](../harnesspermissions/)
- [HarnessSkill](../harnessskill/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [HarnessToolset](../harnesstoolset/)
- [ModelProvider](../modelprovider/)
