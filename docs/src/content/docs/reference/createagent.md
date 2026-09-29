---
title: "createAgent"
description: "createAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAgent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose a harness and a model without starting a process or making a network request. The model is a name or an AgentModel object; the harness or its model provider rejects unsupported reasoning levels and output limits immediately. CLI harnesses may keep their native default model; a custom harness requires one.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name              | Type                                                                         | Presence          | Meaning                                                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions \| CustomAgentOptions \| AgentOptions`                      | Required          | Harness and model selection to bind into one executable agent.                                                                                                                                                        |
| `options.harness` | `CliHarness \| Harness \| CliHarness \| Harness`                             | Required          | CLI execution preset to bind to the selected model.                                                                                                                                                                   |
| `options.model`   | `ModelSpec \| undefined \| ModelSpec \| ModelSpec \| undefined \| ModelSpec` | Variant-dependent | Model name, or an AgentModel object with optional reasoning and output limit. The executing harness or provider validates supported values when the agent is composed. Omission selects the native CLI default model. |

## Returns

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function createAgent(options: CliAgentOptions): CliAgent;
```

## Related contracts

- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
