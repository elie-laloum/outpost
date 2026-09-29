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

Group conversation utilities: transported builds a transport-backed store, harness the custom harness store, rewrite relocates recorded cwd values and projectKey derives the Claude project folder name. Each agent’s native store comes from its own function: createClaudeConversations(), createCodexConversations(), createCopilotConversations() or createKimiConversations(). These utilities do not manage agent authentication.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name          | Type                                                                                    | Presence | Meaning                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transported` | `(base: ConversationStore, options: TransportConversationOptions) => ConversationStore` | Required | Build a native conversation store over a caller-owned transport with a stable project namespace, including child transcripts and local materialization. |
| `harness`     | `() => ConversationStore`                                                               | Required | Create the default custom harness conversation store, whose transcripts live in .outpost/conversations/harness of the target repository.                |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                        | Required | Rewrite native transcript repository paths from source to destination without file I/O.                                                                 |
| `projectKey`  | `(path: string) => string`                                                              | Required | Encode a repository path as the Claude native project directory key.                                                                                    |

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
