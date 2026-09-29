---
title: "NativeConversationStore"
description: "NativeConversationStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { NativeConversationStore } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                             | Presence | Meaning                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `string`                                                                         | Required | Persisted format name written in conversation records, transport keys and session bundles. Keep it stable once conversations have been captured.                          |
| `directory`   | `(repository: string, home?: string) => string`                                  | Required | Host directory that holds this format’s captured conversations for a repository, below home when given.                                                                   |
| `destination` | `(id: string, sandbox: SandboxLease, original: string) => string`                | Required | Sandbox path that restoring the conversation id writes, given its captured host file.                                                                                     |
| `name`        | `string`                                                                         | Required | Store name, such as claude or transport:&lt;namespace>:&lt;format>. Outpost pairs it with the conversation id to skip restoring a conversation the sandbox already holds. |
| `locate`      | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Required | Finds a captured conversation on the host from its id, the repository and an optional home, before it is restored. Rejects when the conversation is missing.              |
| `capture`     | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Required | Saves conversation id from the context’s sandbox to the host after a turn and returns its record.                                                                         |
| `restore`     | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Required | Writes a located record into the context’s sandbox before a continued turn, relocating recorded paths to the sandbox workspace.                                           |

## Signature

```ts
export interface NativeConversationStore extends ConversationStore {
  /** Persisted format name, used in transport keys, bundles and records. */
  readonly format: string;
  /** Host directory that holds this format's captured conversations. */
  directory(repository: string, home?: string): string;
  /** Sandbox path that restoration writes for a captured conversation. */
  destination(id: string, sandbox: SandboxLease, original: string): string;
}
```

## Related contracts

- [ConversationStore](../conversationstore/)
- [SandboxLease](../sandboxlease/)
