---
title: "ConversationStore"
description: "ConversationStore — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationStore**. Consultez le [guide conversations](../../agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [ConversationContext](../conversationcontext/)
- [ConversationRecord](../conversationrecord/)
