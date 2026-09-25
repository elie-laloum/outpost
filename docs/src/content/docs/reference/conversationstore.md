---
title: "ConversationStore"
description: "ConversationStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationStore**. See the [conversations guide](../../guide/agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import type { ConversationStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name      | Type                                                                             | Presence | Meaning                                                                 |
| --------- | -------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`    | `string`                                                                         | Required | See the linked contract and this family's rules for its interpretation. |
| `locate`  | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Required | See the linked contract and this family's rules for its interpretation. |
| `capture` | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Required | See the linked contract and this family's rules for its interpretation. |
| `restore` | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Required | See the linked contract and this family's rules for its interpretation. |

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
