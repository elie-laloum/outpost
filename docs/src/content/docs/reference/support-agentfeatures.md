---
title: "AgentFeatures"
description: "AgentFeatures — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                    | Type                                                  | Presence | Meaning                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | `string`                                              | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                              |
| `bootstrap`             | `string \| undefined`                                 | Optional | Name of the built-in installer used to install a missing CLI on remote providers when bootstrapping is enabled: a pinned npm package for claude, codex, copilot and kimi, or a versioned archive with a pinned SHA-512 digest for antigravity. |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optional | Require the native finished protocol event before treating an agent turn as complete.                                                                                                                                                          |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined` | Optional | CLI accounting capability: events expects usage in the decoded stream, session collects counters after exit, and unavailable declares that tokens cannot be measured. Omission preserves legacy adapter behavior.                              |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                         |
| `storage`               | `ConversationStore \| undefined`                      | Optional | Custom conversation persistence implementation for this adapter.                                                                                                                                                                               |
| `capture`               | `boolean \| undefined`                                | Optional | Whether the adapter enables native transcript capture.                                                                                                                                                                                         |
| `resumable`             | `boolean \| undefined`                                | Optional | Whether the agent can continue a conversation, including response repair. Cold continuation additionally requires a conversation store; fork support is declared separately.                                                                   |
| `forkable`              | `boolean \| undefined`                                | Optional | Whether conversation branching is supported; false rejects fork before allocation. Omitted preserves the adapter’s existing fork behavior. Resume support is declared separately.                                                              |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optional | Parse a native transcript to recover token usage when available.                                                                                                                                                                               |

## Signature

```ts
export interface AgentFeatures {
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
