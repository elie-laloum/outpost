---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
This first phase makes text-only HTTP calls without Codex. The agent harness is planned for phase two: tool execution, repository editing and conversation persistence are not implemented. This API cannot be used as a dispatch agent or sandbox provider; its contract may change. See the [implemented scope and planned harness](../../guide/advanced/model-providers/).
:::

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                              | Presence | Meaning                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                          | Required | Provider identity; the built-in direct client reports openai-compatible.                                                                                                                                                                             |
| `generate` | `(request: ModelRequest) => Promise<ModelResult>` | Required | Send one independent text request and resolve with complete text and optional observed usage. Reject on invalid input, HTTP failure, cancellation, deadline, malformed output, refusal, truncation or tool calls; no retry or tool execution occurs. |

## Signature

```ts
export interface ModelProvider {
  readonly name: string;
  generate(request: ModelRequest): Promise<ModelResult>;
}
```

## Related contracts

- [ModelRequest](../modelrequest/)
- [ModelResult](../modelresult/)
