---
title: "ConversationLocation"
description: "ConversationLocation — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationLocation**. See the [conversations guide](../../agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import type { ConversationLocation } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
```

## Related contracts

- [ConversationFormat](../conversationformat/)
