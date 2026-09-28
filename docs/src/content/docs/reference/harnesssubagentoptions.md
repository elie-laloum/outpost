---
title: "HarnessSubagentOptions"
description: "HarnessSubagentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSubagentOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type          | Presence | Meaning                                                                                                                                  |
| ------------- | ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`      | Required | Unique tool name exposed to the parent model, using 1–64 letters, digits, underscores or hyphens.                                        |
| `description` | `string`      | Required | Explain when the parent should delegate to this child; sent with the tool schema.                                                        |
| `agent`       | `CustomAgent` | Required | Built-in agent created with agent({ harness: harness(...), model }); owns child instructions, tools and limits. CLI agents are rejected. |

## Signature

```ts
export interface HarnessSubagentOptions {
  readonly name: string;
  readonly description: string;
  readonly agent: CustomAgent;
}
```

## Related contracts

- [CustomAgent](../customagent/)
