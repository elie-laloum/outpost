---
title: "ConversationStore"
description: "ConversationStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationStore**. See the [conversations guide](../../agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import type { ConversationStore } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ConversationStore {
  readonly name: string;
  locate(
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationRecord>;
  capture(
    id: string,
    context: ConversationContext,
  ): Promise<ConversationRecord>;
  restore(
    record: ConversationRecord,
    context: ConversationContext,
  ): Promise<void>;
}
```

## Related contracts

- [ConversationContext](../conversationcontext/)
- [ConversationRecord](../conversationrecord/)
