---
title: "AgentOptions"
description: "AgentOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                                  | Presence          | Meaning                                                                                                                                                                                                                          |
| --------- | ------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `CliHarness \| CustomHarness`         | Required          | Execution harness; its kind selects CLI supervision or a custom callback.                                                                                                                                                        |
| `model`   | `ModelSpec \| undefined \| ModelSpec` | Variant-dependent | Model name, or an AgentModel object with optional reasoning and output limit. The executing harness or provider validates supported values when the agent is composed. Required for custom harnesses; optional for CLI defaults. |

## Signature

```ts
export type AgentOptions = CliAgentOptions | CustomAgentOptions;
```

## Related contracts

- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgentOptions](../support-customagentoptions/)
