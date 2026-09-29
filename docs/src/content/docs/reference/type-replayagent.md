---
title: "ReplayAgent"
description: "ReplayAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayAgent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                  | Presence | Meaning                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"replay"`                                            | Required | Execution discriminator for replay agents.                                                                                                                                                                                                     |
| `source`                | `"harness" \| "agent"`                                | Required | Observation source used for replayed events: harness when the journal came from the Outpost harness, otherwise agent.                                                                                                                          |
| `divergence`            | `ReplayDivergencePolicy`                              | Required | Divergence policy: fail throws ReplayDivergence; warn reports prompt, baseline and tree differences as warnings and continues.                                                                                                                 |
| `turns`                 | `readonly ReplayTurn[]`                               | Required | Recorded turns parsed from the journal, in execution order.                                                                                                                                                                                    |
| `remainingTurns`        | `number`                                              | Required | Number of recorded turns not yet consumed by a dispatch; 0 after a complete replay.                                                                                                                                                            |
| `nextTurn`              | `() => ReplayTurn \| undefined`                       | Required | Consume and return the next recorded turn, or undefined when the journal is exhausted. Dispatch calls it once per turn; a replay agent is single-use.                                                                                          |
| `pendingSteering`       | `() => readonly string[] \| undefined`                | Required | Recorded instructions that resumed the next turn, without consuming it; dispatch uses them to continue a steered pass as recorded. Undefined when the next turn was not a steering resumption.                                                 |
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
export interface ReplayAgent extends AgentFeatures {
  readonly kind: "replay";
  readonly source: "agent" | "harness";
  readonly divergence: ReplayDivergencePolicy;
  readonly turns: readonly ReplayTurn[];
  readonly remainingTurns: number;
  nextTurn(): ReplayTurn | undefined;
  /** Instructions that resumed the next recorded turn, without consuming it. */
  pendingSteering(): readonly string[] | undefined;
}
```

## Related contracts

- [AgentFeatures](../support-agentfeatures/)
- [ReplayDivergencePolicy](../replaydivergencepolicy/)
- [ReplayTurn](../replayturn/)
