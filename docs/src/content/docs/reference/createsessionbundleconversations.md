---
title: "createSessionBundleConversations"
description: "createSessionBundleConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSessionBundleConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a native ConversationStore for a CLI that keeps each session as a directory, described by a SessionBundleProfile. A Node.js script run inside the sandbox packs the selected files into one JSON bundle limited to 64 MiB and 4,096 files, rejects symlinks and files that change during capture, and restores through staging with a .outpost-recovery backup. Profile hooks are serialized and must be self-contained function expressions; a method or a regular expression with the g or y flag is rejected when the store is created.

[Complete example and detailed rules](../../guide/conversation-formats/).

## Parameters and properties

| Name             | Type                   | Presence | Meaning                                                                     |
| ---------------- | ---------------------- | -------- | --------------------------------------------------------------------------- |
| `sessionProfile` | `SessionBundleProfile` | Required | Session directory layout, file selection and sandbox-side hooks of the CLI. |

## Returns

`NativeConversationStore`

## Signature

```ts
export declare function createSessionBundleConversations(
  sessionProfile: SessionBundleProfile,
): NativeConversationStore;
```

## Related contracts

- [NativeConversationStore](../nativeconversationstore/)
- [SessionBundleProfile](../sessionbundleprofile/)
