---
title: "harness"
description: "harness — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import { harness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose the built-in Outpost engine from a model provider, tools, instructions, limits and tool execution settings. Validation happens immediately; nothing runs until the agent is dispatched. The engine calls the model, validates and runs tools in the borrowed sandbox and fails with code limit when a bound is reached. run callbacks are rejected.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                    | Type                                                                              | Presence | Meaning                                                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `CustomHarnessOptions`                                                            | Required | Model provider, instructions, tools, loop limits, tool execution settings and history caching for the built-in Outpost engine.                                            |
| `options.modelProvider` | `ModelProvider`                                                                   | Required | Request transport the engine calls for each step; it validates the agent model when the agent is composed.                                                                |
| `options.instructions`  | `HarnessInstructionsOption \| undefined`                                          | Optional | System instructions as text, a defineHarnessInstructions() result or a list of both. Resolved at each turn and joined with blank lines; empty results are skipped.        |
| `options.tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined`                | Optional | Tools and toolsets the model may call. Nested toolsets are flattened; names must be unique across the harness.                                                            |
| `options.limits`        | `HarnessLimits \| undefined`                                                      | Optional | Bounds on steps, tool calls and token usage. Reaching one fails the turn with code limit.                                                                                 |
| `options.toolExecution` | `HarnessToolExecution \| undefined`                                               | Optional | Tool concurrency, per-call deadline and error policy.                                                                                                                     |
| `options.hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[] \| undefined` | Optional | Hooks from defineHarnessHook, run in declaration order within each phase.                                                                                                 |
| `options.permissions`   | `HarnessPermissions \| undefined`                                                 | Optional | Rules from defineHarnessPermissions, evaluated before before-tool hooks.                                                                                                  |
| `options.context`       | `HarnessContextStrategy \| undefined`                                             | Optional | Strategy that can rewrite the history before each model request, such as truncateToolResults() or summarizeHistory().                                                     |
| `options.conversations` | `false \| ConversationStore \| undefined`                                         | Optional | Store for turn transcripts; defaults to harnessConversations(). Use transportConversations("harness", …) for remote storage or false to disable continuation and repairs. |
| `options.skills`        | `readonly HarnessSkill[] \| undefined`                                            | Optional | Skills listed in the system instructions and loaded on demand through the load_skill tool.                                                                                |
| `options.cache`         | `boolean \| undefined`                                                            | Optional | Ask the provider to cache the conversation prefix; defaults to true. OpenAI caches stable prefixes automatically.                                                         |

## Returns

`CustomHarness`

## Signature

```ts
export declare function harness(options: CustomHarnessOptions): CustomHarness;
```

## Related contracts

- [CustomHarness](../type-customharness/)
- [CustomHarnessOptions](../customharnessoptions/)
