---
title: "ScriptedTurn"
description: "ScriptedTurn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScriptedTurn } from "@elie-laloum/outpost/testing";
```

## Parameters and properties

| Name     | Type                                 | Presence | Meaning                                                                                                                                                       |
| -------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`   | `string \| undefined`                | Optional | Text event appended after the supplied events; omitted means no additional answer text.                                                                       |
| `events` | `readonly AgentEvent[] \| undefined` | Optional | Events emitted in order before text and usage. Conversation IDs belong to the agent and cannot be supplied here. A finished event is appended when absent.    |
| `usage`  | `Usage \| undefined`                 | Optional | Simulated token counters for normal workflow accounting. Defaults to complete zero counters unless events contains usage; combining both sources is rejected. |
| `commit` | `ScriptedCommit \| undefined`        | Optional | Real host Git commit applied before emitting events, even for a nonzero scripted status. No commit is made when omitted.                                      |
| `status` | `number \| undefined`                | Optional | Simulated process exit status, an integer from 0 to 255, default 0. Nonzero status exercises normal dispatch failure and workflow retry behavior.             |
| `stderr` | `string \| undefined`                | Optional | Simulated standard error emitted after the events; empty by default.                                                                                          |

## Signature

```ts
export interface ScriptedTurn {
  readonly text?: string;
  readonly events?: readonly AgentEvent[];
  readonly usage?: Usage;
  readonly commit?: ScriptedCommit;
  readonly status?: number;
  readonly stderr?: string;
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [ScriptedCommit](../scriptedcommit/)
- [Usage](../usage/)
