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

| Name            | Type                               | Presence          | Meaning                                                                                                                                  |
| --------------- | ---------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"cli" \| "custom"`                | Required          | Execution discriminator: cli or custom.                                                                                                  |
| `bind`          | `(model?: string) => AgentAdapter` | Variant-dependent | Build the CLI adapter for an optional model identifier without launching the program.                                                    |
| `modelProvider` | `ModelProvider`                    | Variant-dependent | Reusable request transport used by the execution callback; no model catalog is imposed.                                                  |
| `run`           | `HarnessRun`                       | Variant-dependent | Caller implementation returning text and optional usage. It must cooperate with cancellation and await its sandbox and model operations. |

## Signature

```ts
export type Harness = CliHarness | CustomHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CustomHarness](../type-customharness/)
