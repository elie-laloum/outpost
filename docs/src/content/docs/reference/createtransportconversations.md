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

Build a ConversationStore for the claude, codex, copilot, kimi or harness format using transport snapshots and a stable project namespace. Pass it as the conversations option of the matching harness preset or createHarness(); the store declares its format so a mismatched harness fails when it is created. Capture preserves native relocation, child transcripts and session bundles; locate materializes an immutable snapshot below the target repository’s recovery directory. Returned file paths remain readable and reference identifies the remote index. Native files and credentials are separate; archives are neither encrypted nor authenticated.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                           | Presence | Meaning                                                                                                                                                                                     |
| --------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`              | `StoredConversationFormat`     | Required | Transcript format: claude or codex for native JSONL, copilot or kimi for native session bundles, or harness for custom harness transcripts. Antigravity has no portable conversation store. |
| `options`             | `TransportConversationOptions` | Required | Transport and stable project namespace shared by all runners restoring these conversations.                                                                                                 |
| `options.namespace`   | `string`                       | Required | Stable logical project namespace, independent of checkout paths. Use distinct namespaces for unrelated projects.                                                                            |
| `options.transporter` | `Transport`                    | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport.                                                                  |

## Returns

`ConversationStore`

## Signature

```ts
export declare function createTransportConversations(
  format: StoredConversationFormat,
  options: TransportConversationOptions,
): ConversationStore;
```

## Related contracts

- [ConversationStore](../conversationstore/)
- [StoredConversationFormat](../storedconversationformat/)
- [TransportConversationOptions](../transportconversationoptions/)
