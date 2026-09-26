---
title: "ModelToolCallBlock"
description: "ModelToolCallBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider-neutral messages, tool calls and replayable reasoning for model transports. No streaming yet; the contract may change before release.
:::

## Import

```ts
import type { ModelToolCallBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type          | Presence | Meaning                                                                                                                               |
| ------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `type`  | `"tool-call"` | Required | Block discriminator: tool-call.                                                                                                       |
| `id`    | `string`      | Required | Service-issued call identifier that the matching tool result must reference.                                                          |
| `name`  | `string`      | Required | Name of the requested tool, as declared in the request tools.                                                                         |
| `input` | `unknown`     | Required | Parsed tool arguments. When the service returns invalid JSON, the raw string is kept so the caller can report the error to the model. |

## Signature

```ts
export interface ModelToolCallBlock {
  readonly type: "tool-call";
  readonly id: string;
  readonly name: string;
  readonly input: unknown;
}
```
