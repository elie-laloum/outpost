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

| Name                    | Type                                                  | Presence | Meaning                                                                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resumable`             | `boolean`                                             | Required | True unless the harness sets conversations: false, which disables resume, fork and response repair.                                                                                                                                                     |
| `capture`               | `boolean`                                             | Required | True unless the harness sets conversations: false. Transcripts go to the harness conversation store, by default .outpost/conversations/harness in the repository.                                                                                       |
| `kind`                  | `"custom"`                                            | Required | Execution discriminator: custom.                                                                                                                                                                                                                        |
| `harness`               | `Harness`                                             | Required | Built-in harness from createHarness(), with its model provider, tools and limits.                                                                                                                                                                       |
| `model`                 | `AgentModel`                                          | Required | Normalized frozen AgentModel whose name, reasoning and output limit are applied to model requests by default.                                                                                                                                           |
| `usageInput`            | `"inclusive" \| "uncached" \| undefined`              | Optional | Input-token convention for pricing CLI usage: inclusive by default, uncached when cache reads and writes are additional. Does not alter reported aggregate counters.                                                                                    |
| `name`                  | `string`                                              | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                       |
| `bootstrap`             | `string \| undefined`                                 | Optional | Built-in agent whose pinned CLI Outpost installs on a remote sandbox when the executable is missing: an npm package, or a SHA-512-verified archive for antigravity. An unknown name fails.                                                              |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optional | Require the native final event: without it, completion markers do not match and the turn fails with code process, even when the process exits with 0.                                                                                                   |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined` | Optional | How token usage is measured: events reads it from the output stream, session reads the session after the process exits, unavailable records none. Missing counters then mark usage incomplete; omitted, reported events are counted without that check. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optional | Environment variables added to every command of this agent, over the values from .outpost/.env. A name also set by the sandbox provider fails with code configuration.                                                                                  |
| `storage`               | `ConversationStore \| undefined`                      | Optional | Conversation store that captures, locates and restores this agent’s sessions; absent when its conversations are not portable.                                                                                                                           |
| `forkable`              | `boolean \| undefined`                                | Optional | Left unset by createAgent(), so the built-in harness forks by copying the conversation under a new ID. False rejects a fork before allocation.                                                                                                          |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optional | Read token usage from the transcript captured after the turn; a result replaces the usage reported by events, undefined keeps it.                                                                                                                       |

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
