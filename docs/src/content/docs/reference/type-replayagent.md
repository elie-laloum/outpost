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

| Name                    | Type                                                  | Presence | Meaning                                                                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"replay"`                                            | Required | Always replay. It distinguishes a replay agent, which has no harness or model, from cli and custom agents in the Agent union.                                                                                                                           |
| `source`                | `"harness" \| "agent"`                                | Required | Observation source used for replayed events: harness when the journal came from the Outpost harness, otherwise agent.                                                                                                                                   |
| `divergence`            | `ReplayDivergencePolicy`                              | Required | Divergence policy: fail throws ReplayDivergence; warn reports prompt, baseline, tree and unrecorded divergences as warnings and continues.                                                                                                              |
| `turns`                 | `readonly ReplayTurn[]`                               | Required | Recorded turns parsed from the journal, in execution order.                                                                                                                                                                                             |
| `remainingTurns`        | `number`                                              | Required | Number of recorded turns not yet consumed by a dispatch; 0 after a complete replay.                                                                                                                                                                     |
| `nextTurn`              | `() => ReplayTurn \| undefined`                       | Required | Consume and return the next recorded turn, or undefined when the journal is exhausted. Dispatch calls it once per turn; a replay agent is single-use.                                                                                                   |
| `pendingSteering`       | `() => readonly string[] \| undefined`                | Required | Recorded instructions that resumed the next turn, without consuming it; dispatch uses them to continue a steered pass as recorded. Undefined when the next turn was not a steering resumption.                                                          |
| `usageInput`            | `"inclusive" \| "uncached" \| undefined`              | Optional | Input-token convention for pricing CLI usage: inclusive by default, uncached when cache reads and writes are additional. Does not alter reported aggregate counters.                                                                                    |
| `name`                  | `string`                                              | Required | Native agent identifier used in execution events and diagnostics.                                                                                                                                                                                       |
| `bootstrap`             | `string \| undefined`                                 | Optional | Built-in agent whose pinned CLI Outpost installs on a remote sandbox when the executable is missing: an npm package, or a SHA-512-verified archive for antigravity. An unknown name fails.                                                              |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optional | Require the native final event: without it, completion markers do not match and the turn fails with code process, even when the process exits with 0.                                                                                                   |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined` | Optional | How token usage is measured: events reads it from the output stream, session reads the session after the process exits, unavailable records none. Missing counters then mark usage incomplete; omitted, reported events are counted without that check. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optional | Environment variables added to every command of this agent, over the values from .outpost/.env. A name also set by the sandbox provider fails with code configuration.                                                                                  |
| `storage`               | `ConversationStore \| undefined`                      | Optional | Conversation store that captures, locates and restores this agent’s sessions; absent when its conversations are not portable.                                                                                                                           |
| `capture`               | `boolean \| undefined`                                | Optional | Save the conversation to storage after each turn; false skips it. Omitted, a turn is saved whenever storage is present.                                                                                                                                 |
| `resumable`             | `boolean \| undefined`                                | Optional | Whether the agent can continue a conversation, as continuation, response repairs and resume-based steering require; false rejects continuation before allocation. Cold continuation also needs storage.                                                 |
| `forkable`              | `boolean \| undefined`                                | Optional | Whether the agent can fork a conversation; false rejects fork before allocation. Omitted, fork is attempted through request() or the fork hook.                                                                                                         |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optional | Read token usage from the transcript captured after the turn; a result replaces the usage reported by events, undefined keeps it.                                                                                                                       |

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
