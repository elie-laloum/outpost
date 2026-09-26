---
title: "Harness"
description: "Harness — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Harness } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name            | Type                                                                 | Presence          | Meaning                                                                                                                                              |
| --------------- | -------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"cli" \| "custom"`                                                  | Required          | Execution discriminator: cli or custom.                                                                                                              |
| `bind`          | `(model?: AgentModel) => AgentAdapter`                               | Variant-dependent | Build the CLI adapter for an optional normalized AgentModel without launching the program; unsupported reasoning or output limits are rejected here. |
| `modelProvider` | `ModelProvider`                                                      | Variant-dependent | Request transport the engine calls for each step; it validates the agent model when the agent is composed.                                           |
| `instructions`  | `readonly HarnessInstructions[]`                                     | Variant-dependent | Normalized instruction sources resolved at the start of each turn.                                                                                   |
| `tools`         | `readonly HarnessTool<unknown>[]`                                    | Variant-dependent | Flattened, frozen tool list sent to the model in declaration order.                                                                                  |
| `limits`        | `ResolvedHarnessLimits`                                              | Variant-dependent | Normalized limits; maxSteps defaults to 100.                                                                                                         |
| `toolExecution` | `Required<HarnessToolExecution>`                                     | Variant-dependent | Normalized tool execution settings with defaults applied.                                                                                            |
| `hooks`         | `readonly HarnessHook<import("./hook.types.ts").HarnessHookPhase>[]` | Variant-dependent | Frozen hooks of the harness.                                                                                                                         |
| `permissions`   | `HarnessPermissions \| undefined`                                    | Variant-dependent | Permission rules evaluated before before-tool hooks, when set.                                                                                       |
| `cache`         | `boolean`                                                            | Variant-dependent | Whether each request asks the provider to cache the conversation prefix.                                                                             |

## Signature

```ts
export type Harness = CliHarness | CustomHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CustomHarness](../type-customharness/)
