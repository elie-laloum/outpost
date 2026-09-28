---
title: "CustomAgent"
description: "CustomAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomAgent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                      | Presence | Meaning                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resumable`             | `boolean`                                                 | Required | Whether the agent can continue a conversation, including response repair. Cold continuation additionally requires a conversation store; fork support is declared separately.                                                                   |
| `capture`               | `boolean`                                                 | Required | Always false: the custom runner does not capture native transcripts.                                                                                                                                                                           |
| `kind`                  | `"custom"`                                                | Required | Execution discriminator: custom.                                                                                                                                                                                                               |
| `harness`               | `Harness`                                                 | Required | Built-in Outpost harness with its configured model provider.                                                                                                                                                                                   |
| `model`                 | `AgentModel`                                              | Required | Normalized frozen AgentModel whose name, reasoning and output limit are applied to model requests by default.                                                                                                                                  |
| `name`                  | `string`                                                  | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                              |
| `bootstrap`             | `string \| undefined`                                     | Optional | Name of the built-in installer used to install a missing CLI on remote providers when bootstrapping is enabled: a pinned npm package for claude, codex, copilot and kimi, or a versioned archive with a pinned SHA-512 digest for antigravity. |
| `requiresFinishedEvent` | `boolean \| undefined`                                    | Optional | Require the native finished protocol event before treating an agent turn as complete.                                                                                                                                                          |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined`     | Optional | CLI accounting capability: events expects usage in the decoded stream, session collects counters after exit, and unavailable declares that tokens cannot be measured. Omission preserves legacy adapter behavior.                              |
| `variables`             | `Readonly<Record<string, string>> \| undefined`           | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                         |
| `conversations`         | `"codex" \| "claude" \| "copilot" \| "kimi" \| undefined` | Optional | Built-in native transcript format used when no custom storage is supplied.                                                                                                                                                                     |
| `storage`               | `ConversationStore \| undefined`                          | Optional | Custom conversation persistence implementation for this adapter.                                                                                                                                                                               |
| `forkable`              | `boolean \| undefined`                                    | Optional | Whether conversation branching is supported; false rejects fork before allocation. Omitted preserves the adapter’s existing fork behavior. Resume support is declared separately.                                                              |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`     | Optional | Parse a native transcript to recover token usage when available.                                                                                                                                                                               |

## Signature

```ts
export interface CustomAgent extends AgentFeatures {
  readonly resumable: boolean;
  readonly capture: boolean;
  readonly kind: "custom";
  readonly harness: Harness;
  readonly model: AgentModel;
}
```

## Related contracts

- [AgentFeatures](../support-agentfeatures/)
- [AgentModel](../agentmodel/)
- [Harness](../type-customharness/)
