---
title: "CliHarness"
description: "CliHarness — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CliHarness } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type                                   | Presence | Meaning                                                                                                                                              |
| ------ | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind` | `"cli"`                                | Required | Execution discriminator: cli.                                                                                                                        |
| `bind` | `(model?: AgentModel) => AgentAdapter` | Required | Build the CLI adapter for an optional normalized AgentModel without launching the program; unsupported reasoning or output limits are rejected here. |

## Signature

```ts
export interface CliHarness {
  readonly kind: "cli";
  bind(model?: AgentModel): AgentAdapter;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [AgentModel](../agentmodel/)
