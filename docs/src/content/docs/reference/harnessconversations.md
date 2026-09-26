---
title: "harnessConversations"
description: "harnessConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { harnessConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the default conversation store of custom harnesses. Transcripts live in .outpost/conversations/harness under the target repository; locating a missing conversation fails with code session, and restore is a no-op because the loop runs on the host.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Returns

`ConversationStore`

## Signature

```ts
export declare function harnessConversations(): ConversationStore;
```

## Related contracts

- [ConversationStore](../conversationstore/)
