---
title: "AgentFeatures"
description: "AgentFeatures — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                    | Type                                                                                                                                                                      | Presence | Meaning                                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileWorkspaces`        | `{ readonly dispatch: boolean; readonly interactive?: boolean; readonly liveInput?: boolean; readonly continuation?: boolean; readonly repairs?: boolean; } \| undefined` | Optional | Explicitly demonstrated adapter capabilities for dispatch, terminal, live input, continuation and repairs outside Git.                                                                                                                                  |
| `usageInput`            | `"inclusive" \| "uncached" \| undefined`                                                                                                                                  | Optional | Input-token convention for pricing CLI usage: inclusive by default, uncached when cache reads and writes are additional. Does not alter reported aggregate counters.                                                                                    |
| `name`                  | `string`                                                                                                                                                                  | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                       |
| `bootstrap`             | `string \| undefined`                                                                                                                                                     | Optional | Built-in agent whose pinned CLI Outpost installs on a remote sandbox when the executable is missing: an npm package, or a SHA-512-verified archive for antigravity. An unknown name fails.                                                              |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                                                                                                    | Optional | Require the native final event: without it, completion markers do not match and the turn fails with code process, even when the process exits with 0.                                                                                                   |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined`                                                                                                                     | Optional | How token usage is measured: events reads it from the output stream, session reads the session after the process exits, unavailable records none. Missing counters then mark usage incomplete; omitted, reported events are counted without that check. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                                                                                                           | Optional | Environment variables added to every command of this agent, over the values from .outpost/.env. A name also set by the sandbox provider fails with code configuration.                                                                                  |
| `storage`               | `ConversationStore \| undefined`                                                                                                                                          | Optional | Conversation store that captures, locates and restores this agent’s sessions; absent when its conversations are not portable.                                                                                                                           |
| `capture`               | `boolean \| undefined`                                                                                                                                                    | Optional | Save the conversation to storage after each turn; false skips it. Omitted, a turn is saved whenever storage is present.                                                                                                                                 |
| `resumable`             | `boolean \| undefined`                                                                                                                                                    | Optional | Whether the agent can continue a conversation, as continuation, response repairs and resume-based steering require; false rejects continuation before allocation. Cold continuation also needs storage.                                                 |
| `forkable`              | `boolean \| undefined`                                                                                                                                                    | Optional | Whether the agent can fork a conversation; false rejects fork before allocation. Omitted, fork is attempted through request() or the fork hook.                                                                                                         |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                                                                                                     | Optional | Read token usage from the transcript captured after the turn; a result replaces the usage reported by events, undefined keeps it.                                                                                                                       |

## Signature

```ts
export interface AgentFeatures {
  readonly fileWorkspaces?: {
    readonly dispatch: boolean;
    readonly interactive?: boolean;
    readonly liveInput?: boolean;
    readonly continuation?: boolean;
    readonly repairs?: boolean;
  };
  readonly usageInput?: "inclusive" | "uncached";
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly usage?: "events" | "session" | "unavailable";
  readonly variables?: Variables;
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  readonly forkable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
}
```

## Related contracts

- [ConversationStore](../conversationstore/)
- [Usage](../usage/)
- [Variables](../variables/)
