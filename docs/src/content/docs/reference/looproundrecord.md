---
title: "LoopRoundRecord"
description: "LoopRoundRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LoopRoundRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                   | Presence | Meaning                                                                                                                                    |
| -------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `round`  | `number`                               | Required | One-based logical round recorded in execution order.                                                                                       |
| `phase`  | `"complete" \| "attempt" \| "check"`   | Required | Last saved transition: attempt awaits a candidate, check has one, complete has a verification decision.                                    |
| `output` | `WorkflowCheckpointValue \| undefined` | Optional | Encoded candidate output saved before verification when checkpointing is enabled; absent for in-memory-only loops and unfinished attempts. |
| `check`  | `LoopCheckResult \| undefined`         | Optional | Accepted or rejected verification decision for a completed round, including feedback on rejection.                                         |

## Signature

```ts
export interface LoopRoundRecord {
  readonly round: number;
  readonly phase: "attempt" | "check" | "complete";
  readonly output?: WorkflowCheckpointValue;
  readonly check?: LoopCheckResult;
}
```

## Related contracts

- [LoopCheckResult](../loopcheckresult/)
- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
