---
title: "TranscriptConversationLayout"
description: "TranscriptConversationLayout — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TranscriptConversationLayout } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                                                         | Presence | Meaning                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`           | `string`                                                                     | Required | Persisted format name written in conversation records and transport keys.                                                                                          |
| `sidecars`         | `boolean`                                                                    | Required | Whether child transcripts under &lt;transcript directory>/&lt;id>/subagents are captured and restored with the main transcript; a failed child capture only warns. |
| `searchRoot`       | `(home: string) => string`                                                   | Required | Host directory searched recursively for a transcript when locating a conversation.                                                                                 |
| `remoteSearchRoot` | `(home: string) => string`                                                   | Required | Sandbox directory searched with find when capturing a conversation.                                                                                                |
| `pattern`          | `(id: string) => string`                                                     | Required | find -name pattern that matches the transcript file of a conversation in the sandbox.                                                                              |
| `matches`          | `(file: string, id: string) => boolean`                                      | Required | Whether a host file found under searchRoot is the transcript of the conversation.                                                                                  |
| `directory`        | `(repository: string, home: string) => string`                               | Required | Host directory that holds the captured transcripts of a repository.                                                                                                |
| `preferredPath`    | `((id: string, repository: string, home: string) => string) \| undefined`    | Optional | Host path checked first when locating a conversation, before searching searchRoot.                                                                                 |
| `capturePath`      | `(id: string, repository: string, home: string, original: string) => string` | Required | Host path where capture writes the transcript found at original in the sandbox.                                                                                    |
| `remotePath`       | `(id: string, lease: SandboxLease, original: string) => string`              | Required | Sandbox path where restoration writes a captured transcript for the lease workspace.                                                                               |

## Signature

```ts
export interface TranscriptConversationLayout {
  /** Persisted format name, used in transport keys and conversation records. */
  readonly format: string;
  /** Whether child transcripts live under `<directory>/<id>/subagents/`. */
  readonly sidecars: boolean;
  searchRoot(home: string): string;
  remoteSearchRoot(home: string): string;
  /** `find -name` pattern matching the transcript file in the sandbox. */
  pattern(id: string): string;
  matches(file: string, id: string): boolean;
  directory(repository: string, home: string): string;
  preferredPath?(id: string, repository: string, home: string): string;
  capturePath(
    id: string,
    repository: string,
    home: string,
    original: string,
  ): string;
  remotePath(id: string, lease: SandboxLease, original: string): string;
}
```

## Related contracts

- [SandboxLease](../sandboxlease/)
