---
title: "agent"
description: "agent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { agent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose a harness and a model identifier without starting a process or making a network request. CLI harnesses may keep their native default model; a custom harness requires a nonempty model.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name              | Type                                                             | Presence          | Meaning                                                                                 |
| ----------------- | ---------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions \| CustomAgentOptions \| AgentOptions`          | Required          | Harness and model selection to bind into one executable agent.                          |
| `options.harness` | `CliHarness \| CustomHarness \| CliHarness \| CustomHarness`     | Required          | CLI execution preset to bind to the selected model.                                     |
| `options.model`   | `string \| undefined \| string \| string \| undefined \| string` | Variant-dependent | Nonempty model identifier forwarded unchanged; omission selects the native CLI default. |

## Returns

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function agent(options: CliAgentOptions): CliAgent;
```

## Related contracts

- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
