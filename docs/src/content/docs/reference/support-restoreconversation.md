---
title: "restoreConversation"
description: "restoreConversation — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Upload a previously located native transcript into the sandbox’s agent home, rewriting repository paths from the original checkout to the current workspace before continuation.

## Parameters and properties

| Name       | Type                   | Presence | Meaning                                                                                |
| ---------- | ---------------------- | -------- | -------------------------------------------------------------------------------------- |
| `location` | `ConversationLocation` | Required | Existing transcript identity, format and host file path to restore.                    |
| `lease`    | `SandboxLease`         | Required | Sandbox execution lease used to access the native agent home and transfer transcripts. |
| `staging`  | `string`               | Required | Host directory used to stage native transcript files during transfer.                  |

## Returns

`Promise<void>`

## Signature

```ts
export declare function restoreConversation(
  location: ConversationLocation,
  lease: SandboxLease,
  staging: string,
): Promise<void>;
```

## Related contracts

- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
