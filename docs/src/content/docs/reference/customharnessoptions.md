---
title: "CustomHarnessOptions"
description: "CustomHarnessOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Hooks, permissions, persisted conversations and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { CustomHarnessOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                               | Presence | Meaning                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelProvider` | `ModelProvider`                                                    | Required | Request transport the engine calls for each step; it validates the agent model when the agent is composed.                                                         |
| `instructions`  | `HarnessInstructionsOption \| undefined`                           | Optional | System instructions as text, a defineHarnessInstructions() result or a list of both. Resolved at each turn and joined with blank lines; empty results are skipped. |
| `tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optional | Tools and toolsets the model may call. Nested toolsets are flattened; names must be unique across the harness.                                                     |
| `limits`        | `HarnessLimits \| undefined`                                       | Optional | Bounds on steps, tool calls and token usage. Reaching one fails the turn with code limit.                                                                          |
| `toolExecution` | `HarnessToolExecution \| undefined`                                | Optional | Tool concurrency, per-call deadline and error policy.                                                                                                              |
| `cache`         | `boolean \| undefined`                                             | Optional | Ask the provider to cache the conversation prefix; defaults to true. OpenAI caches stable prefixes automatically.                                                  |

## Signature

```ts
export interface CustomHarnessOptions {
  readonly modelProvider: ModelProvider;
  readonly instructions?: HarnessInstructionsOption;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
  readonly limits?: HarnessLimits;
  readonly toolExecution?: HarnessToolExecution;
  readonly cache?: boolean;
}
```

## Related contracts

- [HarnessInstructionsOption](../harnessinstructionsoption/)
- [HarnessLimits](../harnesslimits/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [HarnessToolset](../harnesstoolset/)
- [ModelProvider](../modelprovider/)
