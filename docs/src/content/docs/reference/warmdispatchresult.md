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

| Name                  | Type                                                                             | Presence | Meaning                                                                                               |
| --------------------- | -------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `resume`              | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Required | Continue this result’s conversation on the still-open original sandbox.                               |
| `fork`                | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Required | Fork this result’s conversation on the still-open original sandbox.                                   |
| `text`                | `string`                                                                         | Required | Final text reported by the agent execution.                                                           |
| `conversation`        | `string \| undefined`                                                            | Optional | Available native conversation identity.                                                               |
| `usage`               | `Usage`                                                                          | Required | Reported usage counters; not a currency estimate.                                                     |
| `branch`              | `string`                                                                         | Required | Name of the work branch used or observed during execution.                                            |
| `directory`           | `string`                                                                         | Required | Host workspace directory used for this execution.                                                     |
| `commits`             | `readonly Commit[]`                                                              | Required | Collected Git commit identities and subjects.                                                         |
| `transcript`          | `string \| undefined`                                                            | Optional | Available host path to the captured transcript.                                                       |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optional | Pinned remote index for the final captured conversation, when using transported conversation storage. |
| `logReference`        | `TransportReference \| undefined`                                                | Optional | Pinned committed journal index for readJournal; log remains reserved for actual local file paths.     |
| `log`                 | `string \| undefined`                                                            | Optional | Host path of the dispatch journal, when logging produced one.                                         |
| `retainedDirectory`   | `string \| undefined`                                                            | Optional | Workspace retained for inspection or recovery.                                                        |
| `turns`               | `readonly Turn[]`                                                                | Required | Ordered agent-turn results, including text, status, duration and token usage for each pass.           |
| `value`               | `T`                                                                              | Required | Validated structured response value; undefined when no response specification was supplied.           |
| `completed`           | `boolean`                                                                        | Required | Whether the configured completion marker matched.                                                     |
| `completion`          | `string \| undefined`                                                            | Optional | Completion marker that matched the agent’s output, when one was found.                                |

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
