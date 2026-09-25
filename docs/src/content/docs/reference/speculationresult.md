---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                                                                                                           | Presence | Meaning                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                       | Required | Unique identifier of this speculative race.                                                        |
| `baseline`   | `string`                                                                                                                                       | Required | Git commit used as the initial snapshot for measuring new work.                                    |
| `host`       | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Required | Host checkout snapshots before and after the race, with change detection and any inspection error. |
| `status`     | `"aborted" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                                   | Required | Race outcome: winner, no-winner, aborted or budget-exhausted.                                      |
| `winner`     | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optional | Selected candidate that passed validation and completed cleanup, when one exists.                  |
| `candidates` | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Required | Final status, branch, retained work and available output of every candidate.                       |
| `usage`      | `WorkflowUsage`                                                                                                                                | Required | Cumulative admitted attempts and observed token usage, including restored accounting.              |
| `error`      | `unknown`                                                                                                                                      | Optional | Original failure encountered during candidate execution, validation or race cleanup.               |

## Signature

```ts
export interface SpeculationResult<T = undefined> {
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status: "winner" | "no-winner" | "aborted" | "budget-exhausted";
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}
```

## Related contracts

- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
