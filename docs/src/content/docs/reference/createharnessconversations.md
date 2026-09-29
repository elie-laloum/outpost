---
title: "createHarnessConversations"
description: "createHarnessConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the default store of createHarness() agents, whose transcripts are &lt;repository>/.outpost/conversations/harness/&lt;id>.jsonl. locate and capture only check that this file exists and fail with code session otherwise; restore does nothing because the harness loop runs on the host.

[Complete example and detailed rules](../../guide/conversations/).

## Returns

`ConversationStore`

## Signature

```ts
export declare function createHarnessConversations(): ConversationStore;
```

## Related contracts

- [ConversationStore](../conversationstore/)
