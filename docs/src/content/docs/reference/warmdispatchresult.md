---
title: "WarmDispatchResult"
description: "WarmDispatchResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WarmDispatchResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                                                             | Presence | Meaning                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `resume`              | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Required | Continue this conversation on the same open sandbox with new dispatch options.                                                              |
| `fork`                | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Required | Continue a copy of this conversation on the same open sandbox, leaving the original unchanged.                                              |
| `completion`          | `string \| undefined`                                                            | Optional | Completion marker found in the last turn's text.                                                                                            |
| `text`                | `string`                                                                         | Required | Text of every turn of the execution, joined with newlines, including response repair turns.                                                 |
| `conversation`        | `string \| undefined`                                                            | Optional | Native conversation id of the last turn, when the agent reported one.                                                                       |
| `usage`               | `Usage`                                                                          | Required | Token counters summed over every turn; not a cost.                                                                                          |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optional | Present only when the dispatch used a fallback agent: the candidate that produced this result and the candidates that stopped before it.    |
| `completed`           | `boolean`                                                                        | Required | True when the last turn's text contains a completion marker, or when a typed response was validated.                                        |
| `branch`              | `string`                                                                         | Required | Work branch of this dispatch.                                                                                                               |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optional | Sink and journal failures collected during the dispatch; they do not affect success. With a shared hub, also includes its earlier failures. |
| `directory`           | `string`                                                                         | Required | Host worktree directory of this dispatch.                                                                                                   |
| `commits`             | `readonly Commit[]`                                                              | Required | Commits created during the dispatch, as oid and subject; with several passes, the commits of every pass.                                    |
| `transcript`          | `string \| undefined`                                                            | Optional | Host path of the captured native transcript, when the agent's conversation was captured.                                                    |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optional | Pinned remote index for the final captured conversation, when using transported conversation storage.                                       |
| `logReference`        | `TransportReference \| undefined`                                                | Optional | Versioned journal index for readJournal, for both local and remote persistence. Absent when logging is disabled or directed to stdout.      |
| `retainedDirectory`   | `string \| undefined`                                                            | Optional | Worktree kept after closing because it was detached or held uncommitted changes.                                                            |
| `turns`               | `readonly Turn[]`                                                                | Required | Every turn in order, including response repairs and turns resumed by steering.                                                              |
| `value`               | `T`                                                                              | Required | Parsed and validated response; undefined without a response option.                                                                         |

## Signature

```ts
export interface WarmDispatchResult<T> extends Omit<
  DispatchResult<T>,
  "resume" | "fork"
> {
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
}
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
