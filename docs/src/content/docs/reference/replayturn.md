---
title: "ReplayTurn"
description: "ReplayTurn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayTurn } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                                                                                                                                                                                                                                                                                                                                      | Presence | Meaning                                                                                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt`       | `string`                                                                                                                                                                                                                                                                                                                                                  | Required | Prompt the recorded turn received; replay compares it with the rendered prompt.                                                                                                                          |
| `events`       | `readonly AgentEvent[]`                                                                                                                                                                                                                                                                                                                                   | Required | Agent or harness events re-emitted in order, without execution phases, prompts and summaries.                                                                                                            |
| `text`         | `string`                                                                                                                                                                                                                                                                                                                                                  | Required | Turn text returned to the dispatch: the result event, else concatenated text events, else raw lines.                                                                                                     |
| `usage`        | `Usage`                                                                                                                                                                                                                                                                                                                                                   | Required | Recorded turn usage reported again; no tokens are consumed.                                                                                                                                              |
| `conversation` | `string \| undefined`                                                                                                                                                                                                                                                                                                                                     | Optional | Recorded conversation ID, used only to follow response repairs inside the replay.                                                                                                                        |
| `failure`      | `ReplayFailure \| undefined`                                                                                                                                                                                                                                                                                                                              | Optional | Recorded error of a turn that did not finish; replay rethrows it after the events and commits.                                                                                                           |
| `handover`     | `({ readonly kind: "fallback"; readonly from: import("./fallback-agent.types.js").FallbackCandidate; readonly to: import("./fallback-agent.types.js").FallbackCandidate; readonly failure: import("./fallback-agent.types.js").FallbackTrigger; readonly message: string; readonly resetAt?: string; } & { readonly subagentId?: string; }) \| undefined` | Optional | Recorded fallback event that followed this turn; the turn is then treated as handed over rather than failed, its usage is the sum of its recorded usage events, and replay continues with the next turn. |
| `changes`      | `WorkspaceCommitsEvent \| undefined`                                                                                                                                                                                                                                                                                                                      | Optional | Workspace commits applied inside the sandbox after this turn, the last one of its sandbox dispatch.                                                                                                      |

## Signature

```ts
export interface ReplayTurn {
  readonly prompt: string;
  readonly events: readonly AgentEvent[];
  readonly text: string;
  readonly usage: Usage;
  readonly conversation?: string;
  readonly failure?: ReplayFailure;
  /** Recorded handover of a fallback agent to its next candidate after this turn. */
  readonly handover?: FallbackEvent;
  readonly changes?: WorkspaceCommitsEvent;
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [FallbackEvent](../support-fallbackevent/)
- [ReplayFailure](../replayfailure/)
- [Usage](../usage/)
- [WorkspaceCommitsEvent](../workspacecommitsevent/)
