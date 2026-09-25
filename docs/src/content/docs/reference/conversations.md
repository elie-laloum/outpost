---
title: "conversations"
description: "conversations — Outpost API"
sidebar:
  order: 10
---

Public contract for **conversations**. See the [conversations guide](../../guide/agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import { conversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

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
