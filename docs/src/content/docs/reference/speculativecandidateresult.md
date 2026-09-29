---
title: "SpeculativeCandidateResult"
description: "SpeculativeCandidateResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeCandidateResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                        | Presence | Meaning                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`               | `string`                                                                    | Required | Key of the candidate.                                                                                                                                                                                                                        |
| `commit`            | `string \| undefined`                                                       | Optional | Candidate HEAD read after validate returned, including commits made during validation. checkSpeculationIntegration() blocks if the branch later moves.                                                                                       |
| `attempt`           | `number \| undefined`                                                       | Optional | One-based attempt number; a replay uses a new branch and consumes another shared attempt.                                                                                                                                                    |
| `cleanup`           | `"done" \| "pending" \| undefined`                                          | Optional | done once the sandbox has closed; pending when closing failed or exceeded cleanupMs. A durable race then stays owned, and its next call stops the resource first.                                                                            |
| `resourceId`        | `string \| undefined`                                                       | Optional | Resource the provider registered before allocating the sandbox, such as a container name; durable races only. The next call uses it to stop an orphaned sandbox.                                                                             |
| `branch`            | `string`                                                                    | Required | Candidate branch: outpost/speculation/&lt;id>/&lt;key>, or …/&lt;key>/&lt;attempt> in a durable race. It stays in the repository.                                                                                                            |
| `status`            | `"failed" \| "quota" \| "skipped" \| "cancelled" \| "rejected" \| "winner"` | Required | winner; rejected when validate returned false or another candidate won first; failed when allocation, the agent, validate or cleanup threw; quota; cancelled by a winner, a token limit, your signal or a crash; skipped when never started. |
| `quota`             | `QuotaFault \| undefined`                                                   | Optional | Usage or rate limit that stopped this candidate; durable resumption reruns such candidates as new attempts from the baseline.                                                                                                                |
| `directory`         | `string \| undefined`                                                       | Optional | Host worktree directory of the candidate.                                                                                                                                                                                                    |
| `retainedDirectory` | `string \| undefined`                                                       | Optional | Worktree kept after the sandbox closed: dirty or detached, failed, with cleanup pending, or in a durable race.                                                                                                                               |
| `result`            | `SpeculativeOutput<T> \| undefined`                                         | Optional | Dispatch output, when the candidate's dispatch completed.                                                                                                                                                                                    |
| `error`             | `unknown`                                                                   | Optional | Failure of allocation, dispatch, validate or cleanup; a message string in a restored durable record.                                                                                                                                         |

## Signature

```ts
export interface SpeculativeCandidateResult<T = undefined> {
  readonly key: string;
  readonly commit?: string;
  readonly attempt?: number;
  readonly cleanup?: "pending" | "done";
  readonly resourceId?: string;
  readonly branch: string;
  readonly status:
    "winner" | "rejected" | "failed" | "quota" | "cancelled" | "skipped";
  /** Usage or rate limit that stopped this candidate. */
  readonly quota?: QuotaFault;
  readonly directory?: string;
  readonly retainedDirectory?: string;
  readonly result?: SpeculativeOutput<T>;
  readonly error?: unknown;
}
```

## Related contracts

- [QuotaFault](../type-quotafault/)
- [SpeculativeOutput](../speculativeoutput/)
