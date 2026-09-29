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

| Name          | Type                                                                             | Presence | Meaning                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`      | `string`                                                                         | Required | Persisted format name written in conversation records, transport keys and session bundles. Keep it stable once conversations have been captured. |
| `directory`   | `(repository: string, home?: string) => string`                                  | Required | Host directory that holds this format’s captured conversations for a repository, below home when given.                                          |
| `destination` | `(id: string, sandbox: SandboxLease, original: string) => string`                | Required | Sandbox path that restoring the conversation id writes, given its captured host file.                                                            |
| `name`        | `string`                                                                         | Required | Identifier of this conversation storage implementation.                                                                                          |
| `locate`      | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Required | Find an existing transcript by conversation ID, repository and optional host home.                                                               |
| `capture`     | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Required | Capture the selected sandbox conversation into the context’s host staging directory.                                                             |
| `restore`     | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Required | Restore a transcript record into the context’s sandbox before continuation.                                                                      |

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
