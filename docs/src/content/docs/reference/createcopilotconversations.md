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

Create the native store of GitHub Copilot CLI, the default of createCopilotHarness(). Each session directory under &lt;CLI home>/session-state, where the CLI home is $COPILOT_HOME or ~/.copilot, is captured as one JSON bundle at .outpost/conversations/copilot/&lt;id>.json. Restore rewrites cwd and the git root in workspace.yaml and in the session.start event.

[Complete example and detailed rules](../../guide/conversations/).

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createCopilotConversations(): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
