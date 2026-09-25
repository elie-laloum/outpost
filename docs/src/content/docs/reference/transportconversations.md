---
title: "transportConversations"
description: "transportConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { transportConversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build a Claude or Codex ConversationStore using transport snapshots and a stable project namespace. Capture preserves native relocation and child transcripts; locate materializes an immutable snapshot below the target repository’s recovery directory. Returned file paths remain readable and reference identifies the remote index. Native files and credentials are separate.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                           | Presence | Meaning                                                                                                                    |
| --------------------- | ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `format`              | `ConversationFormat`           | Required | Native transcript format, claude or codex; Gemini has no native conversation storage.                                      |
| `options`             | `TransportConversationOptions` | Required | Transport and stable project namespace shared by all runners restoring these conversations.                                |
| `options.namespace`   | `string`                       | Required | Stable logical project namespace, independent of checkout paths. Use distinct namespaces for unrelated projects.           |
| `options.transporter` | `Transport`                    | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`ConversationStore`

## Signature

```ts
export declare function transportConversations(
  format: ConversationFormat,
  options: TransportConversationOptions,
): ConversationStore;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [ConversationStore](../conversationstore/)
- [TransportConversationOptions](../transportconversationoptions/)
