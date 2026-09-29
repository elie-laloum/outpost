---
title: "ConversationStore"
description: "ConversationStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationStore } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                                             | Presence | Meaning                                                                                                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                         | Required | Store name, such as claude or transport:&lt;namespace>:&lt;format>. Outpost pairs it with the conversation id to skip restoring a conversation the sandbox already holds.                                                                                   |
| `format`  | `string \| undefined`                                                            | Optional | Persisted format this store reads and writes, such as claude, codex, copilot, kimi or harness. A harness rejects a store of another format at creation with code configuration, and createTransportConversations() requires a base store that declares one. |
| `locate`  | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Required | Finds a captured conversation on the host from its id, the repository and an optional home, before it is restored. Rejects when the conversation is missing.                                                                                                |
| `capture` | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Required | Saves conversation id from the context’s sandbox to the host after a turn and returns its record.                                                                                                                                                           |
| `restore` | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Required | Writes a located record into the context’s sandbox before a continued turn, relocating recorded paths to the sandbox workspace.                                                                                                                             |

## Signature

```ts
export interface ConversationStore {
  readonly name: string;
  readonly format?: string;
  locate(
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationRecord>;
  capture(
    id: string,
    context: ConversationContext,
  ): Promise<ConversationRecord>;
  restore(
    record: ConversationRecord,
    context: ConversationContext,
  ): Promise<void>;
}
```

## Related contracts

- [ConversationContext](../conversationcontext/)
- [ConversationRecord](../conversationrecord/)
