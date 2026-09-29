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

Create a NativeConversationStore for a CLI that keeps each session as a directory, described by sessionProfile. A Node.js script in the sandbox packs the selected files into one JSON bundle of at most 64 MiB and 4096 files, refuses symlinks and files that change during capture, and on restore moves an existing session to .outpost-recovery. Script failures use code session; an invalid profile, such as a method hook or a g or y regular expression flag, fails with code configuration at creation.

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
