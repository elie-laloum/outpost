---
title: "AgentFeatures"
description: "AgentFeatures — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                    | Type                                                  | Presence | Meaning                                                                               |
| ----------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `name`                  | `string`                                              | Required | Native agent identifier used in execution events and diagnostics.                     |
| `bootstrap`             | `string \| undefined`                                 | Optional | Shell recipe that installs the native CLI when bootstrapping is enabled.              |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optional | Require the native finished protocol event before treating an agent turn as complete. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                                |
| `conversations`         | `"codex" \| "claude" \| undefined`                    | Optional | Built-in native transcript format used when no custom storage is supplied.            |
| `storage`               | `ConversationStore \| undefined`                      | Optional | Custom conversation persistence implementation for this adapter.                      |
| `capture`               | `boolean \| undefined`                                | Optional | Whether the adapter enables native transcript capture.                                |
| `resumable`             | `boolean \| undefined`                                | Optional | Whether the adapter supports native conversation continuation.                        |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optional | Parse a native transcript to recover token usage when available.                      |

## Signature

```ts
export interface AgentFeatures {
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex";
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
}
```

## Related contracts

- [ConversationStore](../conversationstore/)
- [Usage](../usage/)
- [Variables](../variables/)
