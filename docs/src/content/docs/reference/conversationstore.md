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

| Name      | Type                                                                             | Presence | Meaning                                                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                         | Required | Identifier of this conversation storage implementation.                                                                                                                                                                                       |
| `format`  | `string \| undefined`                                                            | Optional | Transcript format this store handles, such as claude, codex, copilot, kimi or harness. Harnesses reject a store whose declared format differs from their own when they are created; omit it for a custom store that validates records itself. |
| `locate`  | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Required | Find an existing transcript by conversation ID, repository and optional host home.                                                                                                                                                            |
| `capture` | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Required | Capture the selected sandbox conversation into the context’s host staging directory.                                                                                                                                                          |
| `restore` | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Required | Restore a transcript record into the context’s sandbox before continuation.                                                                                                                                                                   |

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
