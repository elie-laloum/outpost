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

Create the native ConversationStore of Kimi Code. Session directories under $KIMI_CODE_HOME or ~/.kimi-code/sessions/<workspace bucket> are captured as bounded JSON bundles without logs, tasks, cron, notifications or locks; restoration picks the destination bucket and rewrites state.json. This is the default store of createKimiHarness().

[Complete example and detailed rules](../../guide/conversations/).

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createKimiConversations(): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
