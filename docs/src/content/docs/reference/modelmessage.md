---
title: "ModelMessage"
description: "ModelMessage — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change before release.
:::

## Import

```ts
import type { ModelMessage } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                           | Presence | Meaning                                                                                                                       |
| --------- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `role`    | `"user" \| "assistant"`        | Required | Author of the message: user for prompts and tool results, assistant for model output.                                         |
| `content` | `readonly ModelContentBlock[]` | Required | Nonempty ordered content blocks. Tool calls and reasoning belong to assistant messages; tool results belong to user messages. |

## Signature

```ts
export interface ModelMessage {
  readonly role: "user" | "assistant";
  readonly content: readonly ModelContentBlock[];
}
```

## Related contracts

- [ModelContentBlock](../modelcontentblock/)
