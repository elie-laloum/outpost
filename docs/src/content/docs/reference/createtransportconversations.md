---
title: "createTransportConversations"
description: "createTransportConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createTransportConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Wrap a base ConversationStore that declares a format, such as createKimiConversations(), so each capture is also archived under conversations/&lt;namespace>/&lt;format>/&lt;id>. locate() materializes the latest snapshot under the repository’s .outpost/recovery/conversations and restore() delegates to the base store. Archives are neither encrypted nor authenticated.

[Complete example and detailed rules](../../guide/conversations/).

## Parameters and properties

| Name                  | Type                           | Presence | Meaning                                                                                                                                                                                                          |
| --------------------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`                | `ConversationStore`            | Required | Store whose captures are archived, such as createKimiConversations() or createHarnessConversations(). Without a format, creation rejects with code configuration.                                                |
| `options`             | `TransportConversationOptions` | Required | Transport and stable project namespace shared by all runners restoring these conversations.                                                                                                                      |
| `options.namespace`   | `string`                       | Required | Project name in the keys, conversations/&lt;namespace>/&lt;format>/&lt;id>; must be a valid transport key. Use the same value on every machine that resumes these conversations, and a distinct one per project. |
| `options.transporter` | `Transport`                    | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport.                                                                                       |

## Returns

`ConversationStore`

## Signature

```ts
export declare function createTransportConversations(
  base: ConversationStore,
  options: TransportConversationOptions,
): ConversationStore;
```

## Related contracts

- [ConversationStore](../conversationstore/)
- [TransportConversationOptions](../transportconversationoptions/)
