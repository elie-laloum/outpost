---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                              | Presence | Meaning                                                                                                                                                               |
| --------------------- | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`                | `string`                          | Required | Text of this turn.                                                                                                                                                    |
| `status`              | `number`                          | Required | Exit status of the agent process. Always 0 in a returned turn: a nonzero status fails the dispatch.                                                                   |
| `interrupted`         | `"steering" \| undefined`         | Optional | steering when Outpost stopped this turn to resume its conversation with a steering instruction; the next turn continues it. Absent for turns that ended on their own. |
| `conversation`        | `string \| undefined`             | Optional | Native conversation id after this turn, when the agent reported one.                                                                                                  |
| `transcript`          | `string \| undefined`             | Optional | Host path of the transcript captured after this turn.                                                                                                                 |
| `transcriptReference` | `TransportReference \| undefined` | Optional | Pinned remote index of the conversation captured after this turn; its local transcript remains available separately.                                                  |
| `usage`               | `Usage`                           | Required | Token counters reported for this turn; not a cost.                                                                                                                    |
| `durationMs`          | `number`                          | Required | Duration of this turn in milliseconds.                                                                                                                                |

## Signature

```ts
export interface Turn {
  readonly text: string;
  readonly status: number;
  /** Set when steering stopped this turn to resume the conversation with new instructions. */
  readonly interrupted?: "steering";
  readonly conversation?: string;
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly usage: Usage;
  readonly durationMs: number;
}
```

## Related contracts

- [TransportReference](../transportreference/)
- [Usage](../usage/)
