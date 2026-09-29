---
title: "createClaudeConversations"
description: "createClaudeConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createClaudeConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the native ConversationStore of Claude Code. Transcripts are single JSONL files under ~/.claude/projects/<project key>, with child transcripts under <id>/subagents; capture and restore rewrite recorded cwd values for the destination workspace. This is the default store of createClaudeHarness().

[Complete example and detailed rules](../../guide/agents/conversations/).

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createClaudeConversations(): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
