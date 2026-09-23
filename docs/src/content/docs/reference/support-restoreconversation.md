---
title: "restoreConversation"
description: "restoreConversation — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export declare function restoreConversation(
  location: ConversationLocation,
  lease: SandboxLease,
  staging: string,
): Promise<void>;
```

## Related contracts

- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
