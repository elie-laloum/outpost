---
title: "remotePath"
description: "remotePath — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export declare function remotePath(
  format: ConversationFormat,
  id: string,
  lease: SandboxLease,
  original: string,
): string;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [SandboxLease](../sandboxlease/)
