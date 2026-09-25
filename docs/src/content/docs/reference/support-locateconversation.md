---
title: "locateConversation"
description: "locateConversation — Outpost API"
sidebar:
  order: 0
---

Supporting contract not directly exported; use TypeScript inference or the public type that references it.

## Purpose and behavior

Locate an existing native transcript by format, conversation ID and repository in the selected host home. It returns the transcript identity and path and rejects when no matching transcript is found.

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                |
| ------------ | --------------------- | -------- | ---------------------------------------------------------------------- |
| `format`     | `ConversationFormat`  | Required | Native transcript layout: claude or codex.                             |
| `id`         | `string`              | Required | Native conversation identifier used to locate or continue the session. |
| `repository` | `string`              | Required | Target host Git checkout.                                              |
| `home`       | `string \| undefined` | Optional | Host agent home used to locate or persist native transcripts.          |

## Returns

`Promise<ConversationLocation>`

## Signature

```ts
export declare function locateConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  home?: string,
): Promise<ConversationLocation>;
```

## Related contracts

- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
