---
title: "nativeConversations"
description: "nativeConversations — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Deprecated: return the built-in native ConversationStore of a claude, codex, copilot or kimi format name, and reject any other name. Use createClaudeConversations(), createCodexConversations(), createCopilotConversations() or createKimiConversations() instead.

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                      |
| -------- | -------- | -------- | ------------------------------------------------------------ |
| `format` | `string` | Required | Built-in native format name: claude, codex, copilot or kimi. |

## Returns

`NativeConversationStore`

## Signature

```ts
declare function nativeConversations(
  format: ConversationFormat,
): NativeConversationStore;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [NativeConversationStore](../nativeconversationstore/)
