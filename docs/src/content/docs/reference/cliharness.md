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

| Name   | Type                                   | Presence | Meaning                                                                                                                                                                |
| ------ | -------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind` | `"cli"`                                | Required | Execution discriminator: cli.                                                                                                                                          |
| `bind` | `(model?: AgentModel) => AgentAdapter` | Required | Build the adapter for an optional model without starting the CLI; createAgent() calls it. Unsupported model settings, authentication forms and MCP options throw here. |

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
