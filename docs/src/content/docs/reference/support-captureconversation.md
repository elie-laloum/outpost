---
title: "captureConversation"
description: "captureConversation — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export declare function captureConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  lease: SandboxLease,
  staging: string,
  options?: CaptureOptions,
): Promise<ConversationLocation>;
```

## Related contracts

- [CaptureOptions](../support-captureoptions/)
- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
