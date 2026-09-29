---
title: "conversations"
description: "conversations — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { conversations } from "@elie-laloum/outpost";
```

## Purpose and behavior

Frozen object that groups conversation helpers: transported is createTransportConversations(), harness is createHarnessConversations(), rewrite is relocateTranscript() and projectKey derives Claude’s project folder name.

[Complete example and detailed rules](../../guide/conversations/).

## Parameters and properties

| Name          | Type                                                                                    | Presence | Meaning                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `transported` | `(base: ConversationStore, options: TransportConversationOptions) => ConversationStore` | Required | createTransportConversations(): wraps a base store so each capture is also archived through a transport.                                 |
| `harness`     | `() => ConversationStore`                                                               | Required | Create the default custom harness conversation store, whose transcripts live in .outpost/conversations/harness of the target repository. |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                        | Required | relocateTranscript(): replaces recorded cwd values equal to source with destination in transcript text, without file I/O.                |
| `projectKey`  | `(path: string) => string`                                                              | Required | Encode a repository path as the Claude native project directory key.                                                                     |

## Signature

```ts
export declare const conversations: Readonly<{
  transported: typeof createTransportConversations;
  harness: typeof createHarnessConversations;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
}>;
```

## Related contracts

- [createHarnessConversations](../createharnessconversations/)
- [createTransportConversations](../createtransportconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
