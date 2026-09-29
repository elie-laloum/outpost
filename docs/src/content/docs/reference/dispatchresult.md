---
title: "DispatchResult"
description: "DispatchResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                                                             | Presence | Meaning                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optional | Sink and journal failures collected during the dispatch; they do not affect success. With a shared hub, also includes its earlier failures.                                 |
| `branch`              | `string`                                                                         | Required | Work branch of this dispatch.                                                                                                                                               |
| `directory`           | `string`                                                                         | Required | Host worktree directory of this dispatch.                                                                                                                                   |
| `commits`             | `readonly Commit[]`                                                              | Required | Commits created during the dispatch, as oid and subject; with several passes, the commits of every pass.                                                                    |
| `transcript`          | `string \| undefined`                                                            | Optional | Host path of the captured native transcript, when the agent's conversation was captured.                                                                                    |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optional | Pinned remote index for the final captured conversation, when using transported conversation storage.                                                                       |
| `logReference`        | `TransportReference \| undefined`                                                | Optional | Versioned journal index for readJournal, for both local and remote persistence. Absent when logging is disabled or directed to stdout.                                      |
| `retainedDirectory`   | `string \| undefined`                                                            | Optional | Worktree kept after closing because it was detached or held uncommitted changes.                                                                                            |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optional | Present only when the dispatch used a fallback agent: the candidate that produced this result and the candidates that stopped before it.                                    |
| `resume`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | Continue this conversation in a new cold dispatch with the agent that produced it; your options are merged over the original ones. Fails when no conversation was captured. |
| `fork`                | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | Continue a copy of this conversation in a new cold dispatch, leaving the original unchanged. Fails when no conversation was captured.                                       |
| `text`                | `string`                                                                         | Required | Text of every turn of the execution, joined with newlines, including response repair turns.                                                                                 |
| `turns`               | `readonly Turn[]`                                                                | Required | Every turn in order, including response repairs and turns resumed by steering.                                                                                              |
| `usage`               | `Usage`                                                                          | Required | Token counters summed over every turn; not a cost.                                                                                                                          |
| `conversation`        | `string \| undefined`                                                            | Optional | Native conversation id of the last turn, when the agent reported one.                                                                                                       |
| `value`               | `T`                                                                              | Required | Parsed and validated response; undefined without a response option.                                                                                                         |
| `completed`           | `boolean`                                                                        | Required | True when the last turn's text contains a completion marker, or when a typed response was validated.                                                                        |
| `completion`          | `string \| undefined`                                                            | Optional | Completion marker found in the last turn's text.                                                                                                                            |

## Signature

```ts
export interface DispatchResult<T> extends Execution<T> {
  readonly observerErrors?: readonly unknown[];
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly logReference?: TransportReference;
  readonly retainedDirectory?: string;
  /** Candidate that ran and candidates that failed before it, for fallback agents. */
  readonly fallback?: FallbackRecord;
  resume<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
}
```

## Related contracts

- [Commit](../commit/)
- [ContinuationOptions](../continuationoptions/)
- [Execution](../execution/)
- [FallbackRecord](../fallbackrecord/)
- [TransportReference](../transportreference/)
