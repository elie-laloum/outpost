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

Wrap a base ConversationStore, such as createKimiConversations() or createHarnessConversations(), so captures are archived as transport snapshots under a stable project namespace and the base store’s format. Pass it as the conversations option of the matching harness preset or createHarness(); the store declares the base format so a mismatched harness fails when it is created. Capture preserves the base store’s relocation, child transcripts and session bundles; locate materializes an immutable snapshot below the target repository’s recovery directory. Returned file paths remain readable and reference identifies the remote index. Native files and credentials are separate; archives are neither encrypted nor authenticated. Passing a format name instead of a store is deprecated.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

## Parameters and properties

| Name                  | Type                           | Presence | Meaning                                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `base`                | `string \| ConversationStore`  | Required | Store whose captures are archived, such as createKimiConversations() or createHarnessConversations(); it must declare a format, which names the transport keys. A format name (claude, codex, copilot, kimi or harness) is deprecated and selects the matching built-in store. |
| `options`             | `TransportConversationOptions` | Required | Transport and stable project namespace shared by all runners restoring these conversations.                                                                                                                                                                                    |
| `options.namespace`   | `string`                       | Required | Stable logical project namespace, independent of checkout paths. Use distinct namespaces for unrelated projects.                                                                                                                                                               |
| `options.transporter` | `Transport`                    | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport.                                                                                                                                                     |

## Returns

`ConversationStore`

## Signature

```ts
export declare function createTransportConversations(
  base: ConversationStore | ConversationFormat,
  options: TransportConversationOptions,
): ConversationStore;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [ConversationStore](../conversationstore/)
- [TransportConversationOptions](../transportconversationoptions/)
