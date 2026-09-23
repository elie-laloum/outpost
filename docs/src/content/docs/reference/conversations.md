---
title: "conversations"
description: "conversations — Outpost API"
sidebar:
  order: 10
---

Public contract for **conversations**. See the [conversations guide](../../agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import { conversations } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare const conversations: {
  native: typeof nativeConversations;
  locate: typeof locateConversation;
  capture: typeof captureConversation;
  restore: typeof restoreConversation;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
  claudePath(id: string, repository: string, home?: string): string;
  directory(
    format: ConversationFormat,
    repository: string,
    home?: string,
  ): string;
  destination: typeof remotePath;
};
```

## Related contracts

- [captureConversation](../support-captureconversation/)
- [ConversationFormat](../conversationformat/)
- [locateConversation](../support-locateconversation/)
- [nativeConversations](../support-nativeconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
- [remotePath](../support-remotepath/)
- [restoreConversation](../support-restoreconversation/)
