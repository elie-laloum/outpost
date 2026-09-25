---
title: "SpeculativeCandidateResult"
description: "SpeculativeCandidateResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeCandidateResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                             | Presence | Meaning                                                                                              |
| ------------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `key`               | `string`                                                         | Required | Unique candidate key used to correlate its branch, validation and final result.                      |
| `branch`            | `string`                                                         | Required | Name of the work branch used or observed during execution.                                           |
| `status`            | `"failed" \| "skipped" \| "cancelled" \| "rejected" \| "winner"` | Required | Candidate outcome: winner, rejected, failed, cancelled or skipped.                                   |
| `directory`         | `string \| undefined`                                            | Optional | Host workspace directory used for this execution.                                                    |
| `retainedDirectory` | `string \| undefined`                                            | Optional | Workspace retained for inspection or recovery.                                                       |
| `result`            | `SpeculativeOutput<T> \| undefined`                              | Optional | Candidate dispatch output with text, commits, usage and typed value, excluding continuation methods. |
| `error`             | `unknown`                                                        | Optional | Original failure encountered during candidate execution, validation or race cleanup.                 |

## Signature

```ts
export interface SpeculativeCandidateResult<T = undefined> {
  readonly key: string;
  readonly branch: string;
  readonly status: "winner" | "rejected" | "failed" | "cancelled" | "skipped";
  readonly directory?: string;
  readonly retainedDirectory?: string;
  readonly result?: SpeculativeOutput<T>;
  readonly error?: unknown;
}
```

## Related contracts

- [SpeculativeOutput](../speculativeoutput/)
