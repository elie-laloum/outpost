---
title: "CustomHarness"
description: "CustomHarness — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Hooks, permissions, persisted conversations and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { CustomHarness } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                              | Presence | Meaning                                                                                                    |
| --------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `kind`          | `"custom"`                        | Required | Execution discriminator: custom.                                                                           |
| `modelProvider` | `ModelProvider`                   | Required | Request transport the engine calls for each step; it validates the agent model when the agent is composed. |
| `instructions`  | `readonly HarnessInstructions[]`  | Required | Normalized instruction sources resolved at the start of each turn.                                         |
| `tools`         | `readonly HarnessTool<unknown>[]` | Required | Flattened, frozen tool list sent to the model in declaration order.                                        |
| `limits`        | `ResolvedHarnessLimits`           | Required | Normalized limits; maxSteps defaults to 100.                                                               |
| `toolExecution` | `Required<HarnessToolExecution>`  | Required | Normalized tool execution settings with defaults applied.                                                  |
| `cache`         | `boolean`                         | Required | Whether each request asks the provider to cache the conversation prefix.                                   |

## Signature

```ts
export interface CustomHarness {
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly instructions: readonly HarnessInstructions[];
  readonly tools: readonly HarnessTool[];
  readonly limits: ResolvedHarnessLimits;
  readonly toolExecution: Required<HarnessToolExecution>;
  readonly cache: boolean;
}
```

## Related contracts

- [HarnessInstructions](../harnessinstructions/)
- [HarnessTool](../harnesstool/)
- [HarnessToolExecution](../harnesstoolexecution/)
- [ModelProvider](../modelprovider/)
- [ResolvedHarnessLimits](../support-resolvedharnesslimits/)
