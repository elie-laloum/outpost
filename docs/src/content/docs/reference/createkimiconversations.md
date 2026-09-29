---
title: "createKimiConversations"
description: "createKimiConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createKimiConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the native store of Kimi Code, the default of createKimiHarness(). Each session directory under &lt;CLI home>/sessions/&lt;workspace bucket>, where the CLI home is $KIMI_CODE_HOME or ~/.kimi-code, is captured as one JSON bundle without its logs, tasks, cron, notify or lock files; only state.json version 2 is accepted. Restore places the session in the destination workspace’s bucket and rewrites state.json.

[Complete example and detailed rules](../../guide/conversations/).

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createKimiConversations(): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
