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

Create a native ConversationStore for a CLI that keeps one JSONL transcript per conversation, described by a TranscriptConversationLayout. Locate searches the host home, capture finds the transcript in the sandbox with find, and restore uploads it; both rewrite recorded cwd values that match the original workspace. Use it for an external CLI harness; the built-in Claude and Codex stores are built with it.

[Complete example and detailed rules](../../guide/agents/conversations/).

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
