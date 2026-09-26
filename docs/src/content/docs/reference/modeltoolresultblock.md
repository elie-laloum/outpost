---
title: "ModelToolResultBlock"
description: "ModelToolResultBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelToolResultBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                   | Presence | Meaning                                                              |
| --------- | ---------------------- | -------- | -------------------------------------------------------------------- |
| `type`    | `"tool-result"`        | Required | Block discriminator: tool-result.                                    |
| `callId`  | `string`               | Required | Identifier of the tool call this result answers.                     |
| `content` | `string`               | Required | Text returned to the model for this call.                            |
| `isError` | `boolean \| undefined` | Optional | Mark the result as a failed tool execution so the model can recover. |

## Signature

```ts
export interface ModelToolResultBlock {
  readonly type: "tool-result";
  readonly callId: string;
  readonly content: string;
  readonly isError?: boolean;
}
```
