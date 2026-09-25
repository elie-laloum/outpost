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

| Name                | Type                                                                             | Presence | Meaning                                                                                     |
| ------------------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `branch`            | `string`                                                                         | Required | Name of the work branch used or observed during execution.                                  |
| `directory`         | `string`                                                                         | Required | Host workspace directory used for this execution.                                           |
| `commits`           | `readonly Commit[]`                                                              | Required | Collected Git commit identities and subjects.                                               |
| `transcript`        | `string \| undefined`                                                            | Optional | Available host path to the captured transcript.                                             |
| `log`               | `string \| undefined`                                                            | Optional | Host path of the dispatch journal, when logging produced one.                               |
| `retainedDirectory` | `string \| undefined`                                                            | Optional | Workspace retained for inspection or recovery.                                              |
| `resume`            | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | Continue this result’s conversation in a newly allocated sandbox.                           |
| `fork`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Required | Fork this result’s conversation in a newly allocated sandbox.                               |
| `text`              | `string`                                                                         | Required | Final text reported by the agent execution.                                                 |
| `turns`             | `readonly Turn[]`                                                                | Required | Ordered agent-turn results, including text, status, duration and token usage for each pass. |
| `usage`             | `Usage`                                                                          | Required | Reported usage counters; not a currency estimate.                                           |
| `conversation`      | `string \| undefined`                                                            | Optional | Available native conversation identity.                                                     |
| `value`             | `T`                                                                              | Required | Validated structured response value; undefined when no response specification was supplied. |
| `completed`         | `boolean`                                                                        | Required | Whether the configured completion marker matched.                                           |
| `completion`        | `string \| undefined`                                                            | Optional | Completion marker that matched the agent’s output, when one was found.                      |

## Signature

```ts
export interface DispatchResult<T> extends Execution<T> {
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly log?: string;
  readonly retainedDirectory?: string;
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
