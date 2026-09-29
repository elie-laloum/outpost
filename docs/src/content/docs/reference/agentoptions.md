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

| Name      | Type                                  | Presence          | Meaning                                                                                                                                                            |
| --------- | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harness` | `CliHarness \| Harness`               | Required          | CLI preset such as createClaudeHarness(), or createHarness() for the built-in loop; any other value throws code configuration.                                     |
| `model`   | `ModelSpec \| undefined \| ModelSpec` | Variant-dependent | Model name or AgentModel object, checked against the harness when the agent is composed. Omit it to keep a CLI’s native default; the built-in harness requires it. |

## Signature

```ts
export type AgentOptions = CliAgentOptions | CustomAgentOptions;
```

## Related contracts

- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgentOptions](../support-customagentoptions/)
