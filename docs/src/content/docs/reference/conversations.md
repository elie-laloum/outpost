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

Group native transcript operations: locate on the host, capture from a sandbox, restore before continuation and rewrite repository paths. native constructs a ConversationStore for Claude or Codex; these storage utilities do not manage agent authentication.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name          | Type                                                                                                                                                                                                                                                                | Presence | Meaning                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transported` | `(format: import("./conversations.types.ts").StoredConversationFormat, options: import("./transport-conversations.types.js").TransportConversationOptions) => import("../index.js").ConversationStore`                                                              | Required | Build a native conversation store over a caller-owned transport with a stable project namespace, including child transcripts and local materialization. |
| `native`      | `(format: ConversationFormat) => import("../index.js").ConversationStore`                                                                                                                                                                                           | Required | Create a native Claude or Codex ConversationStore for transcript persistence.                                                                           |
| `harness`     | `() => import("../index.js").ConversationStore`                                                                                                                                                                                                                     | Required | Create the default custom harness conversation store, whose transcripts live in .outpost/conversations/harness of the target repository.                |
| `locate`      | `(format: ConversationFormat, id: string, repository: string, home?: string) => Promise<import("./conversations.types.ts").ConversationLocation>`                                                                                                                   | Required | Locate a native transcript on the host by format, ID, repository and optional home.                                                                     |
| `capture`     | `(format: ConversationFormat, id: string, repository: string, lease: import("../index.js").SandboxLease, staging: string, options?: import("./conversations/capture.types.js").CaptureOptions) => Promise<import("./conversations.types.ts").ConversationLocation>` | Required | Capture the selected conversation from a sandbox lease into host staging.                                                                               |
| `restore`     | `(location: import("./conversations.types.ts").ConversationLocation, lease: import("../index.js").SandboxLease, staging: string) => Promise<void>`                                                                                                                  | Required | Restore a located transcript into a sandbox and relocate its repository paths.                                                                          |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                                                                                                                                                                                                    | Required | Rewrite native transcript repository paths from source to destination without file I/O.                                                                 |
| `projectKey`  | `(path: string) => string`                                                                                                                                                                                                                                          | Required | Encode a repository path as the Claude native project directory key.                                                                                    |
| `claudePath`  | `(id: string, repository: string, home?: string) => string`                                                                                                                                                                                                         | Required | Compute the host Claude transcript file path for an ID and repository.                                                                                  |
| `directory`   | `(format: ConversationFormat, repository: string, home?: string) => string`                                                                                                                                                                                         | Required | Compute the host transcript directory for the selected format and repository.                                                                           |
| `destination` | `(format: ConversationFormat, id: string, lease: import("../index.js").SandboxLease, original: string) => string`                                                                                                                                                   | Required | Compute the destination transcript path within the sandbox’s agent home.                                                                                |

## Signature

```ts
export declare const conversations: {
  transported: typeof transportConversations;
  native: typeof nativeConversations;
  harness: typeof harnessConversations;
  locate: typeof locateConversation;
  capture: typeof captureConversation;
  restore: typeof restoreConversation;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
  claudePath(id: string, repository: string, home?: string): string;
  directory(
    format: ConversationFormat,
    repository: string,
    home?: string,
  ): string;
  destination: typeof remotePath;
};
```

## Related contracts

- [captureConversation](../support-captureconversation/)
- [ConversationFormat](../conversationformat/)
- [harnessConversations](../harnessconversations/)
- [locateConversation](../support-locateconversation/)
- [nativeConversations](../support-nativeconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
- [remotePath](../support-remotepath/)
- [restoreConversation](../support-restoreconversation/)
- [transportConversations](../transportconversations/)
