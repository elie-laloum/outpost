---
title: "createTranscriptConversations"
description: "createTranscriptConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createTranscriptConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a NativeConversationStore for a CLI that writes one JSONL transcript per conversation, described by layout. capture finds the file in the sandbox with find and copies it to the host, restore uploads it, and both rewrite recorded cwd values for the destination. A missing transcript fails with code session; the Claude and Codex stores are built with it.

[Complete example and detailed rules](../../guide/conversation-formats/).

## Parameters and properties

| Name     | Type                           | Presence | Meaning                                                                              |
| -------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------ |
| `layout` | `TranscriptConversationLayout` | Required | Transcript locations on the host and in the sandbox, with the persisted format name. |

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createTranscriptConversations(
  layout: TranscriptConversationLayout,
): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
- [TranscriptConversationLayout](../transcriptconversationlayout/)
