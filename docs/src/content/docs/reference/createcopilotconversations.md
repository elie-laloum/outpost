---
title: "createCopilotConversations"
description: "createCopilotConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCopilotConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the native ConversationStore of GitHub Copilot CLI. Each session directory under $COPILOT_HOME or ~/.copilot/session-state is captured as one bounded JSON bundle; restoration rewrites workspace.yaml and session.start paths. This is the default store of createCopilotHarness().

[Complete example and detailed rules](../../guide/agents/conversations/).

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createCopilotConversations(): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
