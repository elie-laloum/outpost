---
title: "createCodexConversations"
description: "createCodexConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCodexConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the native ConversationStore of Codex. Rollouts are JSONL files named *-<id>.jsonl under ~/.codex/sessions; capture writes them under today’s date folder and rewrites recorded cwd values. This is the default store of createCodexHarness().

[Complete example and detailed rules](../../guide/conversations/).

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createCodexConversations(): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
