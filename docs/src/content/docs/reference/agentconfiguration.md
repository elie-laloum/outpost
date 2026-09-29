---
title: "AgentConfiguration"
description: "AgentConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentConfiguration } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                           | Presence | Meaning                                                                              |
| ------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------ |
| `files` | `readonly ConfigurationFile[]` | Required | JSON files to merge into the agent home. An empty list only validates the variables. |

## Signature

```ts
export interface AgentConfiguration {
  readonly files: readonly ConfigurationFile[];
}
```

## Related contracts

- [ConfigurationFile](../configurationfile/)
