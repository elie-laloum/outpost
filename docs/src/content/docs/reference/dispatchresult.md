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

| Name                  | Type                                                                             | Presence | Meaning                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optional | Collected sink and journal failures, separate from execution success; a supplied shared hub also exposes its accumulated diagnostics.    |
| `branch`              | `string`                                                                         | Required | Name of the work branch used or observed during execution.                                                                               |
| `directory`           | `string`                                                                         | Required | Host workspace directory used for this execution.                                                                                        |
| `commits`             | `readonly Commit[]`                                                              | Required | Collected Git commit identities and subjects.                                                                                            |
| `transcript`          | `string \| undefined`                                                            | Optional | Available host path to the captured transcript.                                                                                          |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optional | Pinned remote index for the final captured conversation, when using transported conversation storage.                                    |
| `logReference`        | `TransportReference \| undefined`                                                | Optional | Versioned journal index for readJournal, for both local and remote persistence. Absent when logging is disabled or directed to stdout.   |
| `retainedDirectory`   | `string \| undefined`                                                            | Optional | Workspace retained for inspection or recovery.                                                                                           |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optional | Present only when the dispatch used a fallback agent: the candidate that produced this result and the candidates that stopped before it. |
| `resume`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | Continue this result’s conversation in a newly allocated sandbox.                                                                        |
| `fork`                | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | Fork this result’s conversation in a newly allocated sandbox.                                                                            |
| `text`                | `string`                                                                         | Required | Text of every turn of the execution, joined with newlines, including response repair turns.                                              |
| `turns`               | `readonly Turn[]`                                                                | Required | Ordered agent-turn results, including text, status, duration and token usage for each pass.                                              |
| `usage`               | `Usage`                                                                          | Required | Reported usage counters; not a currency estimate.                                                                                        |
| `conversation`        | `string \| undefined`                                                            | Optional | Available native conversation identity.                                                                                                  |
| `value`               | `T`                                                                              | Required | Validated structured response value; undefined when no response specification was supplied.                                              |
| `completed`           | `boolean`                                                                        | Required | Whether the configured completion marker matched.                                                                                        |
| `completion`          | `string \| undefined`                                                            | Optional | Completion marker that matched the agent’s output, when one was found.                                                                   |

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
