---
title: "ModelToolResultBlock"
description: "ModelToolResultBlock — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelToolResultBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                   | Presence | Meaning                                                                                                                         |
| --------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | `"tool-result"`        | Required | Block discriminator: tool-result.                                                                                               |
| `callId`  | `string`               | Required | Identifier of the tool call this result answers.                                                                                |
| `content` | `string`               | Required | Text returned to the model for this call.                                                                                       |
| `isError` | `boolean \| undefined` | Optional | Marks the result as a failed tool execution. Only Anthropic transmits it, as is_error; OpenAI protocols send the content alone. |

## Signature

```ts
export interface ModelToolResultBlock {
  readonly type: "tool-result";
  readonly callId: string;
  readonly content: string;
  readonly isError?: boolean;
}
```
