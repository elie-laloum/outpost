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

| Name   | Type                               | Presence | Meaning                                                                               |
| ------ | ---------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `kind` | `"cli"`                            | Required | Execution discriminator: cli.                                                         |
| `bind` | `(model?: string) => AgentAdapter` | Required | Build the CLI adapter for an optional model identifier without launching the program. |

## Signature

```ts
export interface CliHarness {
  readonly kind: "cli";
  bind(model?: string): AgentAdapter;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
