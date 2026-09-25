---
title: "nativeConversations"
description: "nativeConversations — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Create the native ConversationStore for the selected Claude or Codex format, binding locate, capture and restore to that format’s filesystem layout.

## Parameters and properties

| Name     | Type                 | Presence | Meaning                                    |
| -------- | -------------------- | -------- | ------------------------------------------ |
| `format` | `ConversationFormat` | Required | Native transcript layout: claude or codex. |

## Returns

`ConversationStore`

## Signature

```ts
export declare function nativeConversations(
  format: ConversationFormat,
): ConversationStore;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [ConversationStore](../conversationstore/)
