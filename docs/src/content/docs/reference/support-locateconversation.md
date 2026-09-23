---
title: "locateConversation"
description: "locateConversation — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export declare function locateConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  home?: string,
): Promise<ConversationLocation>;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
