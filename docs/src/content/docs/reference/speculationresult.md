---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                                                                                                                           | Presence | Meaning                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `integration`      | `SpeculationIntegration \| undefined`                                                                                                          | Optional | Merge preflight of the winner's validated commit against the host HEAD at the end of the race; absent without a winner.                                                                                                   |
| `previousAttempts` | `readonly SpeculativeCandidateResult<T>[] \| undefined`                                                                                        | Optional | Durable races only: earlier attempts replaced by a replay after a crash or a quota stop, with their branches and retained worktrees.                                                                                      |
| `id`               | `string`                                                                                                                                       | Required | Race identifier used in candidate branch names; a durable race keeps it across calls.                                                                                                                                     |
| `baseline`         | `string`                                                                                                                                       | Required | Host HEAD commit when the race first started; every candidate branch starts from it.                                                                                                                                      |
| `host`             | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Required | Host checkout snapshots before the race and at its end. changed is true when HEAD, branch, dirty state or content moved, or when the end snapshot failed with error.                                                      |
| `status`           | `"aborted" \| "quota" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                        | Required | winner; aborted when your signal cancelled the race; budget-exhausted; quota when no candidate won and a usage or rate limit stopped at least one; otherwise no-winner. A finished durable race returns its saved status. |
| `quota`            | `QuotaFault \| undefined`                                                                                                                      | Optional | Limit reported with status quota: the earliest known reset among quota-stopped candidates, or the first limit when none is known.                                                                                         |
| `winner`           | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optional | First candidate that validate accepted and whose sandbox closed; absent otherwise.                                                                                                                                        |
| `candidates`       | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Required | Latest attempt of every candidate, in the order of options.candidates.                                                                                                                                                    |
| `usage`            | `WorkflowUsage`                                                                                                                                | Required | Attempts admitted and tokens reported by candidate dispatches, cumulated across the calls of a durable race.                                                                                                              |
| `error`            | `unknown`                                                                                                                                      | Optional | Budget error that stopped the race, such as an exhausted limit or incomplete token usage; a restored durable race gives its saved message. Candidate failures are on each candidate.                                      |

## Signature

```ts
export interface SpeculationResult<T = undefined> {
  readonly integration?: SpeculationIntegration;
  readonly previousAttempts?: readonly SpeculativeCandidateResult<T>[];
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status:
    "winner" | "no-winner" | "quota" | "aborted" | "budget-exhausted";
  /** Earliest known reset among candidates stopped by a usage or rate limit. */
  readonly quota?: QuotaFault;
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}
```

## Related contracts

- [QuotaFault](../type-quotafault/)
- [SpeculationIntegration](../speculationintegration/)
- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
