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

Group conversation utilities: transported builds a transport-backed store, harness the custom harness store, rewrite relocates recorded cwd values and projectKey derives the Claude project folder name. The format-keyed helpers native, locate, capture, restore, directory, destination and claudePath are deprecated; use the store of each agent (createClaudeConversations(), createCodexConversations(), createCopilotConversations(), createKimiConversations()) instead. These utilities do not manage agent authentication.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name          | Type                                                                                                                                                                                                    | Presence | Meaning                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transported` | `(base: ConversationStore \| ConversationFormat, options: TransportConversationOptions) => ConversationStore`                                                                                           | Required | Build a native conversation store over a caller-owned transport with a stable project namespace, including child transcripts and local materialization.                                                              |
| `harness`     | `() => ConversationStore`                                                                                                                                                                               | Required | Create the default custom harness conversation store, whose transcripts live in .outpost/conversations/harness of the target repository.                                                                             |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                                                                                                                                        | Required | Rewrite native transcript repository paths from source to destination without file I/O.                                                                                                                              |
| `projectKey`  | `(path: string) => string`                                                                                                                                                                              | Required | Encode a repository path as the Claude native project directory key.                                                                                                                                                 |
| `native`      | `(format: ConversationFormat) => NativeConversationStore`                                                                                                                                               | Required | Deprecated: return the built-in native store of a format name; use the agent’s create*Conversations() function.                                                                                                      |
| `locate`      | `(format: ConversationFormat, id: string, repository: string, home?: string) => Promise<ConversationLocation>`                                                                                          | Required | Deprecated: locate a native transcript on the host by format, ID, repository and optional home. Use the native store’s locate() instead.                                                                             |
| `capture`     | `(format: ConversationFormat, id: string, repository: string, lease: SandboxLease, staging: string, options?: Pick<ConversationContext, "home" \| "warn" \| "local">) => Promise<ConversationLocation>` | Required | Deprecated: capture the selected conversation from a sandbox lease into host staging. Use the native store’s capture() instead.                                                                                      |
| `restore`     | `(location: ConversationLocation, lease: SandboxLease, staging: string) => Promise<void>`                                                                                                               | Required | Deprecated: restore a located transcript into a sandbox and relocate its repository paths. Use the native store’s restore() instead.                                                                                 |
| `directory`   | `(format: ConversationFormat, repository: string, home?: string) => string`                                                                                                                             | Required | Deprecated: compute the host transcript directory for the selected format and repository. Use the native store’s directory() instead.                                                                                |
| `destination` | `(format: ConversationFormat, id: string, lease: SandboxLease, original: string) => string`                                                                                                             | Required | Deprecated: compute the transcript destination within the sandbox home; Copilot/Kimi return a bundle staging path, which requires restore to materialize native files. Use the native store’s destination() instead. |
| `claudePath`  | `(id: string, repository: string, home?: string) => string`                                                                                                                                             | Required | Deprecated: compute the host Claude transcript file path for an ID and repository. Use createClaudeConversations().directory() instead.                                                                              |

## Signature

```ts
export declare const conversations: Readonly<{
  transported: typeof createTransportConversations;
  harness: typeof createHarnessConversations;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
  /** @deprecated Use createClaudeConversations(), createCodexConversations(), createCopilotConversations() or createKimiConversations(). */
  native: typeof nativeConversations;
  /** @deprecated Use the native store's locate(). */
  locate(
    format: ConversationFormat,
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationLocation>;
  /** @deprecated Use the native store's capture(). */
  capture(
    format: ConversationFormat,
    id: string,
    repository: string,
    lease: SandboxLease,
    staging: string,
    options?: Pick<ConversationContext, "home" | "warn" | "local">,
  ): Promise<ConversationLocation>;
  /** @deprecated Use the native store's restore(). */
  restore(
    location: ConversationLocation,
    lease: SandboxLease,
    staging: string,
  ): Promise<void>;
  /** @deprecated Use the native store's directory(). */
  directory(
    format: ConversationFormat,
    repository: string,
    home?: string,
  ): string;
  /** @deprecated Use the native store's destination(). */
  destination(
    format: ConversationFormat,
    id: string,
    lease: SandboxLease,
    original: string,
  ): string;
  /** @deprecated Use createClaudeConversations().directory(). */
  claudePath(id: string, repository: string, home?: string): string;
}>;
```

## Related contracts

- [ConversationContext](../conversationcontext/)
- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
- [createHarnessConversations](../createharnessconversations/)
- [createTransportConversations](../createtransportconversations/)
- [nativeConversations](../support-nativeconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
- [SandboxLease](../sandboxlease/)
