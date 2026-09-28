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

| Name           | Type                                 | Presence | Meaning                                                                                              |
| -------------- | ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `prompt`       | `string`                             | Required | Prompt the recorded turn received; replay compares it with the rendered prompt.                      |
| `events`       | `readonly AgentEvent[]`              | Required | Agent or harness events re-emitted in order, without execution phases, prompts and summaries.        |
| `text`         | `string`                             | Required | Turn text returned to the dispatch: the result event, else concatenated text events, else raw lines. |
| `usage`        | `Usage`                              | Required | Recorded turn usage reported again; no tokens are consumed.                                          |
| `conversation` | `string \| undefined`                | Optional | Recorded conversation ID, used only to follow response repairs inside the replay.                    |
| `failure`      | `ReplayFailure \| undefined`         | Optional | Recorded error of a turn that did not finish; replay rethrows it after the events and commits.       |
| `changes`      | `WorkspaceCommitsEvent \| undefined` | Optional | Workspace commits applied inside the sandbox after this turn, the last one of its sandbox dispatch.  |

## Signature

```ts
export interface ReplayTurn {
  readonly prompt: string;
  readonly events: readonly AgentEvent[];
  readonly text: string;
  readonly usage: Usage;
  readonly conversation?: string;
  readonly failure?: ReplayFailure;
  readonly changes?: WorkspaceCommitsEvent;
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [ReplayFailure](../replayfailure/)
- [Usage](../usage/)
- [WorkspaceCommitsEvent](../workspacecommitsevent/)
