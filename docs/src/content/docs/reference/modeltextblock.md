---
title: "ModelTextBlock"
description: "ModelTextBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelTextBlock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type     | Presence | Meaning                                                               |
| ------ | -------- | -------- | --------------------------------------------------------------------- |
| `type` | `"text"` | Required | Block discriminator: text.                                            |
| `text` | `string` | Required | Plain text of the block; empty text blocks are not sent to Anthropic. |

## Signature

```ts
export interface ModelTextBlock {
  readonly type: "text";
  readonly text: string;
}
```
